import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { CommunicationModule } from './communication/communication.module';
import { ProvidersModule } from './providers/providers.module';
import { SafetyModule } from './safety/safety.module';
import { UsersModule } from './users/users.module';
import { ConvertUserAndProviderIdsToIntegers1760830000000 } from './database/migrations/1760830000000-ConvertUserAndProviderIdsToIntegers';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || 5432),
      username: process.env.DB_USERNAME || 'clinton',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE || 'skills_directory',
      autoLoadEntities: true,
      synchronize: true,
    }),

    AuthModule,
    UsersModule,
    ProvidersModule,
    SafetyModule,
    CommunicationModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}