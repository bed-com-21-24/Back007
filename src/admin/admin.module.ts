
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

import { User, Provider } from './entities/admin.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Provider]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}