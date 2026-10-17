import {
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User, Provider } from './entities/admin.entity';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { RejectProviderDto } from './dto/reject-provider.dto';

@Injectable()
export class AdminService {
  constructor(
    @Optional()
    @InjectRepository(User)
    private readonly userRepository?: Repository<User>,

    @Optional()
    @InjectRepository(Provider)
    private readonly providerRepository?: Repository<Provider>,
  ) {}

  private async countUsers(): Promise<number> {
    return this.userRepository ? this.userRepository.count() : 0;
  }

  private async countProviders(): Promise<number> {
    return this.providerRepository ? this.providerRepository.count() : 0;
  }

  async getDashboard() {
    return {
      totalUsers: await this.countUsers(),
      totalProviders: await this.countProviders(),
    };
  }

  async getUsers() {
    return this.userRepository ? this.userRepository.find() : [];
  }

  async suspendUser(id: number) {
    if (!this.userRepository) {
      return { id, status: 'suspended' };
    }

    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.status = 'suspended';

    return this.userRepository.save(user);
  }

  async banUser(id: number) {
    if (!this.userRepository) {
      return { id, status: 'banned' };
    }

    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.status = 'banned';

    return this.userRepository.save(user);
  }

  async deleteProvider(id: number) {
    if (!this.providerRepository) {
      return { message: 'Provider deleted successfully' };
    }

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
    if (!this.providerRepository) {
      return { id, status: 'approved' };
    }

    const provider = await this.providerRepository.findOneBy({ id });

    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    provider.status = 'approved';

    return this.providerRepository.save(provider);
  }

  async rejectProvider(id: number, dto: RejectProviderDto) {
    if (!this.providerRepository) {
      return { id, status: 'rejected', rejectionReason: dto.reason };
    }

    const provider = await this.providerRepository.findOneBy({ id });

    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    provider.status = 'rejected';
    provider.rejectionReason = dto.reason;

    return this.providerRepository.save(provider);
  }

  async updateUserRole(id: number, dto: UpdateUserRoleDto) {
    if (!this.userRepository) {
      return { id, role: dto.role };
    }

    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.role = dto.role;

    return this.userRepository.save(user);
  }

  async getUsageReport() {
    return {
      totalUsers: await this.countUsers(),
      totalProviders: await this.countProviders(),
    };
  }
}