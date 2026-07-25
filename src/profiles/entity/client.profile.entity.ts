import {
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  Column,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';

@Entity('client_profiles')
export class ClientProfile {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'date',
  })
  releaseDate!: Date;

  @OneToOne(() => User, (user) => user.clientProfile, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({
    length: 100,
  })
  resume!: string;

  @Column({ length: 100 })
  idCard!: string;
}
