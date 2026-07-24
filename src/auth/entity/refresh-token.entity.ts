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

@Entity('refresh_tokens')
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  // Random id embedded inside the JWT payload (the "jti" claim).
  // Lets us find the exact row in O(1) instead of bcrypt-comparing
  // against every session a user has open.
  @Index({ unique: true })
  @Column()
  jti!: string;

  @Column({ type: 'text' })
  tokenHash!: string;

  @Column({ type: 'varchar', nullable: true, length: 255 })
  userAgent!: string | null;

  @Column({ type: 'varchar', nullable: true, length: 45 })
  ip!: string | null;

  @Column({ type: 'timestamp' })
  expiresAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  revokedAt!: Date | null;

  @CreateDateColumn()
  createdAt!: Date;
}
