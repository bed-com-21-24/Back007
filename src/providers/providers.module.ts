import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Provider } from './entities/provider.entity';
import { Review } from './entities/review.entity';
import { ProvidersController } from './providers.controller';
import { ProvidersService } from './providers.service';
import { ProviderDiscoveryController } from './provider-discovery.controller';
import { ProviderDiscoveryService } from './provider-discovery.service';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';

@Module({
  imports: [TypeOrmModule.forFeature([Provider, Review])],
  controllers: [
    ProvidersController,
    ProviderDiscoveryController,
    ReviewsController,
  ],
  providers: [ProvidersService, ProviderDiscoveryService, ReviewsService],
  exports: [ProvidersService],
})
export class ProvidersModule {}