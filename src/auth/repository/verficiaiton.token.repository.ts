import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, MoreThan, Repository } from 'typeorm';

import {
  VerificationToken,
  VerificationTokenType,
} from '../entity/verification-token.entity';

export interface CreateVerificationTokenInput {
  userId: string;
  type: VerificationTokenType;
  codeHash: string;
  expiresAt: Date;
}

@Injectable()
export class VerificationTokenRepository {
  constructor(
    @InjectRepository(VerificationToken)
    private readonly repository: Repository<VerificationToken>,
  ) {}

  async create(
    input: CreateVerificationTokenInput,
  ): Promise<VerificationToken> {
    const token = this.repository.create({
      userId: input.userId,
      type: input.type,
      codeHash: input.codeHash,
      expiresAt: input.expiresAt,
      consumedAt: null,
    });

    return this.repository.save(token);
  }

  // Latest non-consumed, non-expired token of a given type for a user.
  // This is what login/reset/verify flows should check the code against.
  async findActive(
    userId: string,
    type: VerificationTokenType,
  ): Promise<VerificationToken | null> {
    return this.repository.findOne({
      where: {
        userId,
        type,
        consumedAt: undefined,
        expiresAt: MoreThan(new Date()),
      },
      order: { createdAt: 'DESC' },
    });
  }

  async markConsumed(id: string): Promise<void> {
    await this.repository.update({ id }, { consumedAt: new Date() });
  }

  // Invalidate any earlier unused codes of this type before issuing a
  // fresh one, so only the most recently sent code is ever valid.
  async invalidateActive(
    userId: string,
    type: VerificationTokenType,
  ): Promise<void> {
    await this.repository.update(
      { userId, type, consumedAt: undefined },
      { consumedAt: new Date() },
    );
  }

  async deleteExpired(): Promise<void> {
    await this.repository.delete({ expiresAt: LessThan(new Date()) });
  }
}
