import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Review } from './entities/review.entity';
import { Provider } from './entities/provider.entity';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(Provider)
    private readonly providerRepository: Repository<Provider>,
  ) {}

  async create(residentId: number, providerId: number, dto: CreateReviewDto) {
    const provider = await this.providerRepository.findOne({
      where: { id: providerId },
    });

    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    if (provider.userId === residentId) {
      throw new BadRequestException('You cannot review your own service listing');
    }

    const existingReview = await this.reviewRepository.findOne({
      where: { residentId, providerId },
    });

    if (existingReview) {
      throw new BadRequestException('You have already reviewed this provider');
    }

    const review = this.reviewRepository.create({
      residentId,
      providerId,
      rating: dto.rating,
      comment: dto.comment ?? null,
    });

    await this.reviewRepository.save(review);

    await this.updateProviderRating(providerId);

    return review;
  }

  async findForProvider(providerId: number) {
    return this.reviewRepository.find({
      where: { providerId },
      order: { createdAt: 'DESC' },
    });
  }

  private async updateProviderRating(providerId: number) {
    const result = await this.reviewRepository
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'average')
      .addSelect('COUNT(review.id)', 'count')
      .where('review.providerId = :providerId', { providerId })
      .getRawOne();

    const averageRating = parseFloat(result.average) || 0;
    const reviewCount = parseInt(result.count, 10) || 0;

    await this.providerRepository.update(providerId, {
      averageRating,
      reviewCount,
    });
  }
}