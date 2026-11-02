import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Provider } from './entities/provider.entity';
import { Review } from './entities/review.entity';
import { Category } from './entities/category.entity';
import { ProvidersController } from './providers.controller';
import { ProvidersService } from './providers.service';
import { ProviderDiscoveryService } from './provider-discovery.service';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';

@Module({
  imports: [TypeOrmModule.forFeature([Provider, Review, Category])],
  controllers: [
    ProvidersController,
    ReviewsController,
    CategoriesController,
  ],
  providers: [
    ProvidersService,
    ProviderDiscoveryService,
    ReviewsService,
    CategoriesService,
  ],
  exports: [ProvidersService],
})
export class ProvidersModule {}