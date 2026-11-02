import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  JoinColumn,
  OneToOne,
  OneToMany,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Review } from './review.entity';

@Entity('providers')
export class Provider {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'integer', unique: true, nullable: true })
  userId!: number | null;

  @OneToOne(() => User, (user) => user.provider, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
  user!: User;

  @Column({ type: 'varchar', length: 150 })
  providerName!: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  phoneNumber!: string | null;

  @Column({ type: 'text', nullable: true })
  bio!: string | null;

  @Column({ type: 'varchar', length: 150, nullable: true })
  location!: string | null;

  @Column({
    type: 'text',
    array: true,
    default: () => "'{}'",
  })
  skills!: string[];

  @Index()
  @Column({ type: 'varchar', length: 100, nullable: true })
  tradeCategory!: string | null;

  @Column({ type: 'integer', default: 0 })
  yearsOfExperience!: number;

  @Column({ type: 'double precision', nullable: true })
  latitude!: number | null;

  @Column({ type: 'double precision', nullable: true })
  longitude!: number | null;

  @Column({
    type: 'numeric',
    precision: 3,
    scale: 2,
    default: 0,
    transformer: {
      to: (value?: number | null) => value,
      from: (value?: string | null) =>
        value === null || value === undefined ? 0 : parseFloat(value),
    },
  })
  averageRating!: number;

  @Column({ type: 'integer', default: 0 })
  reviewCount!: number;

  @Index()
  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  rejectionReason!: string | null;

  @OneToMany(() => Review, (review) => review.provider)
  reviews!: Review[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}