import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';

export enum DocumentType {
  RESUME = 'RESUME',
  ID_CARD = 'ID_CARD',
  PROFILE_PICTURE = 'PROFILE_PICTURE',
  CERTIFICATION = 'CERTIFICATION',
  OTHER = 'OTHER',
}

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  userId!: string;

  @ManyToOne(() => User, (user) => user.documents, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({
    type: 'enum',
    enum: DocumentType,
  })
  type!: DocumentType;

  @Column({
    type: 'text',
  })
  url!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
