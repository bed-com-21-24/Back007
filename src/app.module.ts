import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommunicationModule } from './communication/communication.module';
import { SafetyModule } from './safety/safety.module';
import { SafetyController } from './safety/safety.controller';



@Module({
  
  controllers: [AppController, SafetyController],
  providers: [AppService],
  imports: [CommunicationModule, SafetyModule],
})
export class AppModule {}
