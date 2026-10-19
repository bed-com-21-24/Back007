import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, LessThan, Not, Repository } from 'typeorm';
import { BlocksService } from '../safety/blocks.service';
import { Provider } from '../providers/entities/provider.entity';   // Chimwemwe's entity: adjust path
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectRepository(Conversation) private convs: Repository<Conversation>,
    @InjectRepository(Message) private msgs: Repository<Message>,
    @InjectRepository(Provider) private providers: Repository<Provider>,
    private blocks: BlocksService,
  ) {}

  async contactProvider(residentId: number, providerId: number, text: string) {
    const provider = await this.providers.findOne({ where: { id: providerId } });
    if (!provider) throw new NotFoundException('Provider not found');
    // TODO: if providers have an approval status (FR-23), reject unapproved ones

    const providerUserId = provider.userId;
    if (providerUserId === residentId) throw new BadRequestException('You cannot contact yourself');
    await this.blocks.assertNotBlocked(residentId, providerUserId);

    let conv = await this.convs.findOne({ where: { residentId, providerId } });
    if (!conv) conv = await this.convs.save(this.convs.create({ residentId, providerId, providerUserId }));

    return this.saveMessage(conv, residentId, text);
  }

  list(userId: number) {
    return this.convs.find({
      where: [{ residentId: userId }, { providerUserId: userId }],
      order: { lastMessageAt: 'DESC' },
    });
  }

  async getOne(id: string, userId: number, before?: string, limit = 30) {
    const conv = await this.getForParticipant(id, userId);
    const where: any = { conversationId: id };
    if (before) where.createdAt = LessThan(new Date(before));

    const rows = await this.msgs.find({ where, order: { createdAt: 'DESC' }, take: Math.min(limit, 100) });
    await this.msgs.update({ conversationId: id, senderId: Not(userId), readAt: IsNull() }, { readAt: new Date() });
    return { conversation: conv, messages: rows.reverse() };
  }

  async sendMessage(conversationId: string, senderId: number, text: string) {
    const conv = await this.getForParticipant(conversationId, senderId);
    const otherId = conv.residentId === senderId ? conv.providerUserId : conv.residentId;
    await this.blocks.assertNotBlocked(senderId, otherId);
    return this.saveMessage(conv, senderId, text);
  }

  async getForParticipant(id: string, userId: number) {
    const conv = await this.convs.findOne({ where: { id } });
    if (!conv || (conv.residentId !== userId && conv.providerUserId !== userId))
      throw new NotFoundException('Conversation not found');   // same error either way: don't leak existence
    return conv;
  }

  private async saveMessage(conv: Conversation, senderId: number, text: string) {
    const body = text.trim();
    if (!body) throw new BadRequestException('Message cannot be empty');
    const message = await this.msgs.save(this.msgs.create({ conversationId: conv.id, senderId, body }));
    await this.convs.update(conv.id, { lastMessageAt: message.createdAt, lastMessagePreview: body.slice(0, 140) });
    return { message, participantIds: [conv.residentId, conv.providerUserId] };
  }
}