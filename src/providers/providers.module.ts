import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Provider } from './entities/provider.entity';
import { ProvidersController } from './providers.controller';
import { ProvidersService } from './providers.service';
import { ProviderDiscoveryController } from './provider-discovery.controller';
import { ProviderDiscoveryService } from './provider-discovery.service';

@Module({
  imports: [TypeOrmModule.forFeature([Provider])],
  controllers: [ProvidersController, ProviderDiscoveryController],
  providers: [ProvidersService, ProviderDiscoveryService],
import { ProviderReview } from './entities/provider-review.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Provider, ProviderReview])],
  controllers: [ProvidersController],
  providers: [ProvidersService],
  exports: [ProvidersService],
})
export class ProvidersModule {}
