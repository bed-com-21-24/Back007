import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Provider } from './provider.entity';
import { User } from '../../users/entities/user.entity';

@Entity('provider_reviews')
@Unique(['providerId', 'userId'])
@Index(['providerId', 'createdAt'])
export class ProviderReview {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'integer' })
  providerId!: number;

  @ManyToOne(() => Provider, (provider) => provider.reviews, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'providerId' })
  provider!: Provider;

  @Column({ type: 'integer' })
  userId!: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ type: 'smallint' })
  rating!: number;

  @Column({ type: 'text', nullable: true })
  review!: string | null;

  @CreateDateColumn()
  createdAt!: Date;
}
