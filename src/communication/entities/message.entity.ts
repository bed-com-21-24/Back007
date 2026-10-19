import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Conversation } from './conversation.entity';

@Entity('messages')
@Index(['conversationId', 'createdAt'])
export class Message {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column('uuid') conversationId: string;
  @ManyToOne(() => Conversation, (c) => c.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conversationId' })
  conversation: Conversation;

  @Column('integer') senderId: number;
  @Column('text') body: string;
  @Column({ type: 'timestamptz', nullable: true }) readAt: Date | null;
  @CreateDateColumn() createdAt: Date;
}