import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Provider } from './entities/provider.entity';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { UpdateProviderSkillsDto } from './dto/update-provider-skills.dto';

@Injectable()
export class ProvidersService {
  constructor(
    @InjectRepository(Provider)
    private readonly providerRepository: Repository<Provider>,
  ) {}

  async create(userId: number, dto: CreateProviderDto) {
    const existing = await this.providerRepository.findOne({
      where: { userId },
    });

    if (existing) {
      throw new ConflictException('You already have a provider profile');
    }

    const provider = this.providerRepository.create({
      userId,
      providerName: dto.providerName,
      phoneNumber: dto.phoneNumber ?? null,
      bio: dto.bio ?? null,
      location: dto.location ?? null,
      tradeCategory: dto.tradeCategory ?? null,
      yearsOfExperience: dto.yearsOfExperience ?? 0,
      latitude: dto.latitude ?? null,
      longitude: dto.longitude ?? null,
      skills: [],
    });

    return this.providerRepository.save(provider);
  }

  async findMe(userId: number) {
    const provider = await this.providerRepository.findOne({
      where: { userId },
    });

    if (!provider) {
      throw new NotFoundException('Provider profile not found');
    }

    return provider;
  }

  async updateMe(userId: number, dto: UpdateProviderDto) {
    const provider = await this.findMe(userId);
    Object.assign(provider, dto);
    return this.providerRepository.save(provider);
  }

  async updateSkills(userId: number, dto: UpdateProviderSkillsDto) {
    const provider = await this.findMe(userId);
    provider.skills = dto.skills.map((skill) => skill.trim());
    return this.providerRepository.save(provider);
  }
}