import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
<<<<<<< HEAD
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
=======
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
>>>>>>> origin/feature/communication-safety
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();