import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'node:path';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { CommunicationModule } from './communication/communication.module';
import { ProvidersModule } from './providers/providers.module';
import { SafetyModule } from './safety/safety.module';
import { UsersModule } from './users/users.module';

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
 feature/providers-discovery
      synchronize: true,
=======
      synchronize: process.env.NODE_ENV !== 'production',
      migrations: [
        join(__dirname, 'database', 'migrations', '*.ts'),
        join(__dirname, 'database', 'migrations', '*.js'),
      ],
      migrationsRun: process.env.NODE_ENV === 'productio
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