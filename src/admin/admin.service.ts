import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { User } from '../users/entities/user.entity';
import { Provider } from '../providers/entities/provider.entity';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { RejectProviderDto } from './dto/reject-provider.dto';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { ProviderActionDto } from './dto/provider-action.dto';
import { Report } from '../safety/entities/report.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Provider)
    private readonly providerRepository: Repository<Provider>,

    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
  ) {}

  private async countUsers(): Promise<number> {
    return this.userRepository.count();
  }

  private async countProviders(): Promise<number> {
    return this.providerRepository.count();
  }

  async getDashboard() {
    return {
      totalUsers: await this.countUsers(),
      totalProviders: await this.countProviders(),
    };
  }

  async getOverview() {
    const [dashboard, users, usageReport, reports] = await Promise.all([
      this.getDashboard(),
      this.getUsers(),
      this.getUsageReport(),
      this.getReports(),
    ]);

    return { dashboard, users, usageReport, reports };
  }

  async getUsers() {
    const users = await this.userRepository.find({
      relations: { provider: true },
    });

    return users.map(({ password, refreshTokenHash, provider, ...user }) => ({
      ...user,
      provider: provider
        ? (({ user: linkedUser, ...publicProvider }) => publicProvider)(provider)
        : null,
    }));
  }

  async getReports() {
    const reports = await this.reportRepository.find({
      order: { createdAt: 'DESC' },
    });
    const userIds = [
      ...new Set(
        reports.flatMap((report) => [report.reporterId, report.reportedUserId]),
      ),
    ];
    let users: User[] = [];
    let providers: Provider[] = [];
    if (userIds.length > 0) {
      [users, providers] = await Promise.all([
        this.userRepository.find({ where: { id: In(userIds) } }),
        this.providerRepository.find({ where: { userId: In(userIds) } }),
      ]);
    }
    const providerByUserId = new Map(
      providers.map((provider) => [provider.userId, provider]),
    );
    const userById = new Map(
      users.map((user) => {
        const { password, refreshTokenHash, ...safeUser } = user;
        const provider = providerByUserId.get(user.id);
        const safeProvider = provider
          ? (({ user: linkedUser, ...publicProvider }) => publicProvider)(
              provider,
            )
          : null;
        return [
          user.id,
          { ...safeUser, provider: safeProvider },
        ] as const;
      }),
    );

    return reports.map((report) => {
      const reportedUser = userById.get(report.reportedUserId) ?? null;
      const provider = providerByUserId.get(report.reportedUserId);
      return {
        ...report,
        reporter: userById.get(report.reporterId) ?? null,
        reportedUser,
        location: provider
          ? {
              latitude: provider.latitude,
              longitude: provider.longitude,
              address: provider.location,
            }
          : null,
      };
    });
  }

  async createAdmin(dto: CreateAdminDto) {
    const existing = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const admin = this.userRepository.create({
      ...dto,
      password: await bcrypt.hash(dto.password, 10),
      role: 'admin',
      status: 'active',
    });
    const savedAdmin = await this.userRepository.save(admin);
    const { password, refreshTokenHash, ...safeAdmin } = savedAdmin;
    return safeAdmin;
  }

  async updateUser(id: number, dto: AdminUpdateUserDto) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    Object.assign(user, dto);
    const savedUser = await this.userRepository.save(user);
    const { password, refreshTokenHash, ...safeUser } = savedUser;
    return safeUser;
  }

  async updateUserStatus(id: number, dto: UpdateUserStatusDto) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.status = dto.status;
    const savedUser = await this.userRepository.save(user);
    const { password, refreshTokenHash, ...safeUser } = savedUser;
    return safeUser;
  }

  async deleteProvider(id: number) {
    const provider = await this.providerRepository.findOneBy({ id });

    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    await this.providerRepository.remove(provider);

    return {
      message: 'Provider deleted successfully',
    };
  }

  async approveProvider(id: number) {
    const provider = await this.providerRepository.findOneBy({ id });

    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    provider.status = 'approved';

    return this.providerRepository.save(provider);
  }

  async rejectProvider(id: number, dto: RejectProviderDto) {
    const provider = await this.providerRepository.findOneBy({ id });

    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    await this.providerRepository.remove(provider);

    return {
      id: provider.id,
      status: 'rejected',
      rejectionReason: dto.reason,
      message: 'Provider profile rejected and removed; user account remains active',
    };
  }

  async providerAction(id: number, dto: ProviderActionDto) {
    switch (dto.action) {
      case 'approve':
        return this.approveProvider(id);
      case 'reject':
        if (!dto.reason?.trim()) {
          throw new BadRequestException(
            'A reason is required when rejecting a provider listing',
          );
        }
        return this.rejectProvider(id, { reason: dto.reason });
      case 'delete':
        return this.deleteProvider(id);
    }
  }

  async updateUserRole(id: number, dto: UpdateUserRoleDto) {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.role = dto.role;

    const savedUser = await this.userRepository.save(user);
    const { password, refreshTokenHash, ...safeUser } = savedUser;
    return safeUser;
  }

  async getUsageReport() {
    return {
      totalUsers: await this.countUsers(),
      totalProviders: await this.countProviders(),
    };
  }
}