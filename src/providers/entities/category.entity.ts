import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id!: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  @ApiProperty({ example: 'Plumbing' })
  name!: string;

  @Column({ type: 'text', array: true, default: () => "'{}'" })
  @ApiProperty({ example: ['Pipe repair', 'Leak detection'] })
  skills!: string[];

  @Column({ default: true })
  @ApiProperty({ description: 'False if a provider requested this category' })
  isApproved!: boolean;

  @CreateDateColumn()
  createdAt!: Date;
}