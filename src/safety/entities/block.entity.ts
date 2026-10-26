import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('blocks')
@Unique(['blockerId', 'blockedId'])
export class Block {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column('integer') blockerId: number;
  @Column('integer') blockedId: number;
  @CreateDateColumn() createdAt: Date;
}