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

  @Column({ nullable: true })
  resumeUrl!: string;

  @Column({ nullable: true })
  idCardUrl!: string;
}
