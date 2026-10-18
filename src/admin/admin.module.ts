
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User } from '../users/entities/user.entity';
import { Provider } from '../providers/entities/provider.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Provider])],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}