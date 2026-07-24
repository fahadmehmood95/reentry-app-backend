import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';

import { UserRole, UserStatus } from '../../common/enums';
import { CoachProfile } from '../../profiles/entity/coach.profile.entity';
import { ClientProfile } from '../../profiles/entity/client.profile.entity';
import { Document } from '../../documents/entity/documents.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    length: 100,
  })
  firstName!: string;

  @Column({
    length: 100,
  })
  lastName!: string;

  @Column({
    unique: true,
    length: 255,
  })
  email!: string;

  @Column()
  password!: string;

  @Column({
    length: 20,
  })
  phoneNumber!: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CLIENT,
  })
  role!: UserRole;

  @OneToOne(() => CoachProfile, (coachProfile) => coachProfile.user)
  coachProfile?: CoachProfile;

  @OneToOne(() => ClientProfile, (clientProfile) => clientProfile.user)
  clientProfile?: ClientProfile;

  @OneToMany(() => Document, (document) => document.user)
  documents?: Document;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.PENDING,
  })
  status!: UserStatus;

  @Column({
    type: 'text',
    nullable: true,
  })
  refreshTokenHash!: string | null;

  @Column({
    type: 'text',
    nullable: true,
  })
  passwordResetCodeHash!: string | null;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  passwordResetExpiresAt!: Date | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
