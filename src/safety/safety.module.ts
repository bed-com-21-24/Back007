import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Block } from './entities/block.entity';
import { Report } from './entities/report.entity';
import { BlocksService } from './blocks.service';
import { ReportsService } from './reports.service';
import { SafetyController } from './safety.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Block, Report]), AuthModule],
  controllers: [SafetyController],
  providers: [BlocksService, ReportsService],
  exports: [BlocksService],
})
export class SafetyModule {}