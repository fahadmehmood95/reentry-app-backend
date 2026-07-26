import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToOne,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { UserRole, UserStatus } from '../../common/enums';
import { CoachProfile } from '../../profiles/entity/coach.profile.entity';
import { ClientProfile } from '../../profiles/entity/client.profile.entity';
import { Document } from '../../documents/entity/documents.entity';
import { RefreshToken } from '../../auth/entity/refresh-token.entity';
import { VerificationToken } from '../../auth/entity/verification-token.entity';

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

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshTokens?: RefreshToken[];

  @OneToMany(
    () => VerificationToken,
    (verificationToken) => verificationToken.user,
  )
  verificationTokens?: VerificationToken[];

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.PENDING,
  })
  status!: UserStatus;

  @ManyToOne(() => User, (user) => user.clients, {
    nullable: true,
  })
  @JoinColumn({ name: 'coachId' })
  coach!: User | null;

  @Column({
    nullable: true,
  })
  coachId!: string | null;

  @OneToMany(() => User, (user) => user.coach)
  clients?: User[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
