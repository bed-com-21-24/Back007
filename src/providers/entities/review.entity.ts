import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Provider } from './provider.entity';

@Entity('reviews')
@Unique(['residentId', 'providerId'])
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column('integer')
  residentId!: number;

  @Index()
  @Column('integer')
  providerId!: number;

  @ManyToOne(() => Provider, (provider) => provider.reviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'providerId' })
  provider!: Provider;

  @Column('integer')
  rating!: number;

  @Column({ type: 'text', nullable: true })
  comment!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}