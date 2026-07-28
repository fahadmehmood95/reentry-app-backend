import {
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  Column,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

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

  @Column({ nullable: true })
  resumeUrl!: string;

  @Column({ nullable: true })
  experienceLetter!: string;
}
