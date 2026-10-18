import {
  Column,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Provider } from '../../providers/entities/provider.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: 'resident' })
  role: string;

  @Column({ default: 'active' })
  status: string;

  @OneToOne(() => Provider, (provider) => provider.user)
  provider?: Provider;
}