import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';                       // must export JwtModule: ask Beston
import { Provider } from '../providers/entities/provider.entity';       // adjust
import { SafetyModule } from '../safety/safety.module';
import { ChatGateway } from './chat.gateway';
import { ConversationsController } from './conversations.controller';
import { ConversationsService } from './conversations.service';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Conversation, Message, Provider]), SafetyModule, AuthModule],
  controllers: [ConversationsController],
  providers: [ConversationsService, ChatGateway],
})
export class CommunicationModule {}