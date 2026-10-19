
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User } from '../users/entities/user.entity';
import { Provider } from '../providers/entities/provider.entity';
import { AuthModule } from '../auth/auth.module';
import { AdminAuthGuard } from './admin-auth.guard';

@Module({
  imports: [TypeOrmModule.forFeature([User, Provider]), AuthModule],
  controllers: [AdminController],
  providers: [AdminService, AdminAuthGuard],
})
export class AdminModule {}