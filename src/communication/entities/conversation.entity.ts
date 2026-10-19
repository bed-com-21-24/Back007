import { Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Message } from './message.entity';

@Entity('conversations')
@Unique(['residentId', 'providerId'])
export class Conversation {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Index() @Column('integer') residentId: number;
  @Column('integer') providerId: number;
  @Index() @Column('integer') providerUserId: number;

  @Column({ type: 'timestamptz', nullable: true }) lastMessageAt: Date | null;
  @Column({ type: 'varchar', length: 140, nullable: true }) lastMessagePreview: string | null;

  @CreateDateColumn() createdAt: Date;
  @OneToMany(() => Message, (m) => m.conversation) messages: Message[];
}