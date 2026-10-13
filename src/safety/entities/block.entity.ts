import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('blocks')
@Unique(['blockerId', 'blockedId'])
export class Block {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column('uuid') blockerId: string;
  @Column('uuid') blockedId: string;
  @CreateDateColumn() createdAt: Date;
}