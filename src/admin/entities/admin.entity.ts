import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ default: 'resident' })
  role: string;
  
  @Column({ default: 'active' })
  status: string;
}

@Entity('providers')
export class Provider {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ default: 'pending' })
  status: string;

  @Column({ nullable: true })
  rejectionReason?: string;
}
