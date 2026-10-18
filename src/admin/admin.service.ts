import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../users/entities/user.entity';
import { Provider } from '../providers/entities/provider.entity';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { RejectProviderDto } from './dto/reject-provider.dto';
import { UpdateUserDto } from '../users/dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Provider)
    private readonly providerRepository: Repository<Provider>,
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

  async getUsers() {
    const users = await this.userRepository.find({
      relations: { provider: true },
    });

    return users.map(({ password, provider, ...user }) => ({
      ...user,
      provider: provider
        ? (({ user: linkedUser, ...publicProvider }) => publicProvider)(provider)
        : null,
    }));
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
    const { password, ...safeAdmin } = savedAdmin;
    return safeAdmin;
  }

  async updateUser(id: string, dto: UpdateUserDto) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    Object.assign(user, dto);
    const savedUser = await this.userRepository.save(user);
    const { password, ...safeUser } = savedUser;
    return safeUser;
  }

  async suspendUser(id: string) {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.status = 'suspended';

    const savedUser = await this.userRepository.save(user);
    const { password, ...safeUser } = savedUser;
    return safeUser;
  }

  async banUser(id: string) {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.status = 'banned';

    const savedUser = await this.userRepository.save(user);
    const { password, ...safeUser } = savedUser;
    return safeUser;
  }

  async deleteProvider(id: string) {
    const provider = await this.providerRepository.findOneBy({ id });

    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    await this.providerRepository.remove(provider);

    return {
      message: 'Provider deleted successfully',
    };
  }

  async approveProvider(id: string) {
    const provider = await this.providerRepository.findOneBy({ id });

    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    provider.status = 'approved';

    return this.providerRepository.save(provider);
  }

  async rejectProvider(id: string, dto: RejectProviderDto) {
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

  async updateUserRole(id: string, dto: UpdateUserRoleDto) {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.role = dto.role;

    const savedUser = await this.userRepository.save(user);
    const { password, ...safeUser } = savedUser;
    return safeUser;
  }

  async getUsageReport() {
    return {
      totalUsers: await this.countUsers(),
      totalProviders: await this.countProviders(),
    };
  }
}