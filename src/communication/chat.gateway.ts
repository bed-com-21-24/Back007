import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { ConversationsService } from './conversations.service';
import { Message } from './entities/message.entity';

@WebSocketGateway({
  namespace: '/chat',
  cors: { origin: true, credentials: true },
})
export class ChatGateway implements OnGatewayConnection {
  @WebSocketServer() server: Server;

  constructor(
    private jwt: JwtService,
    private conversations: ConversationsService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const raw =
        client.handshake.auth?.token ??
        client.handshake.headers.authorization ??
        '';
      const token = String(raw).replace(/^Bearer\s+/i, '');
      const payload = await this.jwt.verifyAsync(token);
      if (!Number.isSafeInteger(payload.sub) || payload.sub < 1) {
        throw new Error('Invalid user ID in access token');
      }
      client.data.userId = payload.sub; // adjust if the JWT uses another field
      // TODO: reject banned/suspended users here (ask Mwiza which field holds account status)
      client.join(`user:${payload.sub}`);
    } catch {
      client.emit('chat:error', { message: 'Unauthorized' });
      client.disconnect(true);
    }
  }

  @SubscribeMessage('message:send')
  async onSend(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string; body: string },
  ) {
    try {
      if (
        !data?.conversationId ||
        typeof data.body !== 'string' ||
        data.body.length > 2000
      )
        return { ok: false, error: 'Invalid payload' };
      const { message, participantIds } = await this.conversations.sendMessage(
        data.conversationId,
        client.data.userId,
        data.body,
      );
      this.pushMessage(message, participantIds);
      return { ok: true, message };
    } catch (e: any) {
      return { ok: false, error: e.message ?? 'Failed to send' };
    }
  }

  @SubscribeMessage('typing')
  async onTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    try {
      const conv = await this.conversations.getForParticipant(
        data.conversationId,
        client.data.userId,
      );
      const otherId =
        conv.residentId === client.data.userId
          ? conv.providerUserId
          : conv.residentId;
      this.server.to(`user:${otherId}`).emit('typing', {
        conversationId: conv.id,
        userId: client.data.userId,
      });
    } catch {
      /* ignore */
    }
  }

  pushMessage(message: Message, participantIds: number[]) {
    participantIds.forEach((id) =>
      this.server.to(`user:${id}`).emit('message:new', message),
    );
  }
}
