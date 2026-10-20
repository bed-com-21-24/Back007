import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Provider } from './entities/provider.entity';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { UpdateProviderSkillsDto } from './dto/update-provider-skills.dto';
import { SearchProvidersDto } from './dto/search-providers.dto';
import { CreateProviderReviewDto } from './dto/create-provider-review.dto';
import { ProviderReview } from './entities/provider-review.entity';

@Injectable()
export class ProvidersService {
  constructor(
    @InjectRepository(Provider)
    private readonly providerRepository: Repository<Provider>,
    @InjectRepository(ProviderReview)
    private readonly reviewRepository: Repository<ProviderReview>,
  ) {}

  async findAll(filters: SearchProvidersDto) {
    const query = this.providerRepository
      .createQueryBuilder('provider')
      .leftJoin(ProviderReview, 'review', 'review.providerId = provider.id')
      .select('provider')
      .addSelect('COALESCE(AVG(review.rating), 0)', 'averageRating')
      .addSelect('COUNT(review.id)', 'reviewCount')
      .where('provider.status = :status', { status: 'approved' })
      .groupBy('provider.id');

    if (filters.keyword?.trim()) {
      query.andWhere(
        '(provider.providerName ILIKE :keyword OR provider.bio ILIKE :keyword OR EXISTS (SELECT 1 FROM unnest(provider.skills) AS listed(skill) WHERE skill ILIKE :keyword))',
        { keyword: `%${filters.keyword.trim()}%` },
      );
    }
    if (filters.skill?.trim()) {
      query.andWhere(
        'EXISTS (SELECT 1 FROM unnest(provider.skills) AS listed(skill) WHERE skill ILIKE :skill)',
        { skill: `%${filters.skill.trim()}%` },
      );
    }
    if (filters.location?.trim()) {
      query.andWhere('provider.location ILIKE :location', {
        location: `%${filters.location.trim()}%`,
      });
    }

    const { entities, raw } = await query.getRawAndEntities();
    return entities.map((provider, index) => ({
      ...provider,
      averageRating: Number(raw[index].averageRating),
      reviewCount: Number(raw[index].reviewCount),
    }));
  }

  async findOne(id: number) {
    const { entities, raw } = await this.providerRepository
      .createQueryBuilder('provider')
      .leftJoin(ProviderReview, 'review', 'review.providerId = provider.id')
      .select('provider')
      .addSelect('COALESCE(AVG(review.rating), 0)', 'averageRating')
      .addSelect('COUNT(review.id)', 'reviewCount')
      .where('provider.id = :id AND provider.status = :status', {
        id,
        status: 'approved',
      })
      .groupBy('provider.id')
      .getRawAndEntities();
    const provider = entities[0];

    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    return {
      ...provider,
      averageRating: Number(raw[0].averageRating),
      reviewCount: Number(raw[0].reviewCount),
    };
  }

  async getReviews(providerId: number) {
    await this.findOne(providerId);
    const reviews = await this.reviewRepository.find({
      where: { providerId },
      relations: { user: true },
      order: { createdAt: 'DESC' },
    });
    const safeReviews = reviews.map(({ user, ...review }) => ({
      ...review,
      reviewer: { id: user.id, name: user.name },
    }));

    return {
      providerId,
      reviewCount: reviews.length,
      averageRating: reviews.length
        ? Number(
            (
              reviews.reduce((sum, review) => sum + review.rating, 0) /
              reviews.length
            ).toFixed(2),
          )
        : 0,
      reviews: safeReviews,
    };
  }

  async createReview(
    providerId: number,
    userId: number,
    dto: CreateProviderReviewDto,
  ) {
    const provider = await this.findOne(providerId);
    if (provider.userId === userId) {
      throw new BadRequestException(
        'You cannot review your own provider profile',
      );
    }

    const existing = await this.reviewRepository.findOne({
      where: { providerId, userId },
    });
    if (existing) {
      throw new ConflictException('You have already reviewed this provider');
    }

    const review = this.reviewRepository.create({
      providerId,
      userId,
      rating: dto.rating,
      review: dto.review?.trim() || null,
    });
    const savedReview = await this.reviewRepository.save(review);
    return {
      id: savedReview.id,
      providerId: savedReview.providerId,
      userId: savedReview.userId,
      rating: savedReview.rating,
      review: savedReview.review,
      createdAt: savedReview.createdAt,
    };
  }

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
