import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';

export enum VerificationTokenType {
  PASSWORD_RESET = 'PASSWORD_RESET',
  EMAIL_VERIFICATION = 'EMAIL_VERIFICATION',
}

@Entity('verification_tokens')
@Index(['userId', 'type']) // fast lookup: "give me this user's active reset code"
export class VerificationToken {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ type: 'enum', enum: VerificationTokenType })
  type!: VerificationTokenType;

  @Column({ type: 'text' })
  codeHash!: string;

  @Column({ type: 'timestamp' })
  expiresAt!: Date;

  // Set when the code is successfully used. A non-null value means
  // "dead, don't accept this again" even if it hasn't expired yet.
  @Column({ type: 'timestamp', nullable: true })
  consumedAt!: Date | null;

  @CreateDateColumn()
  createdAt!: Date;
}
