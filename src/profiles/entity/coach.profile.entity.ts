import {
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  Column,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';

@Entity('coach_profiles')
export class CoachProfile {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    length: 200,
  })
  specialization!: string;

  @OneToOne(() => User, (user) => user.coachProfile, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user!: User;
}
