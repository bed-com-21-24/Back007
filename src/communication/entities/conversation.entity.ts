import { Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Message } from './message.entity';

@Entity('conversations')
@Unique(['residentId', 'providerId'])
export class Conversation {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Index() @Column('uuid') residentId: string;       // resident's USER id
  @Column('uuid') providerId: string;                // provider PROFILE id (used in the URL)
  @Index() @Column('uuid') providerUserId: string;   // provider's USER id (for auth and blocking)

  @Column({ type: 'timestamptz', nullable: true }) lastMessageAt: Date | null;
  @Column({ type: 'varchar', length: 140, nullable: true }) lastMessagePreview: string | null;

  @CreateDateColumn() createdAt: Date;
  @OneToMany(() => Message, (m) => m.conversation) messages: Message[];
}