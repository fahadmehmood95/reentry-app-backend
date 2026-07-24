import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';

import { RefreshToken } from '../entity/refresh-token.entity';

export interface CreateRefreshTokenInput {
  userId: string;
  jti: string;
  tokenHash: string;
  expiresAt: Date;
  userAgent?: string | null;
  ip?: string | null;
}

@Injectable()
export class RefreshTokenRepository {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly repository: Repository<RefreshToken>,
  ) {}

  async create(input: CreateRefreshTokenInput): Promise<RefreshToken> {
    const refreshToken = this.repository.create({
      userId: input.userId,
      jti: input.jti,
      tokenHash: input.tokenHash,
      expiresAt: input.expiresAt,
      userAgent: input.userAgent ?? null,
      ip: input.ip ?? null,
      revokedAt: null,
    });

    return this.repository.save(refreshToken);
  }

  // O(1) lookup by the jti embedded in the JWT payload, instead of
  // bcrypt-comparing against every session a user has open.
  async findByJti(jti: string): Promise<RefreshToken | null> {
    return this.repository.findOne({ where: { jti } });
  }

  async findActiveByUserId(userId: string): Promise<RefreshToken[]> {
    return this.repository.find({
      where: { userId, revokedAt: undefined },
      order: { createdAt: 'DESC' },
    });
  }

  async revoke(id: string): Promise<void> {
    await this.repository.update({ id }, { revokedAt: new Date() });
  }

  // Log out of one specific session — used on token rotation to
  // invalidate the old token as soon as a new one is issued.
  async revokeByJti(jti: string): Promise<void> {
    await this.repository.update({ jti }, { revokedAt: new Date() });
  }

  // Log out everywhere — used on password change or explicit
  // "log out of all devices".
  async revokeAllForUser(userId: string): Promise<void> {
    await this.repository.update(
      { userId, revokedAt: undefined },
      { revokedAt: new Date() },
    );
  }

  async deleteExpired(): Promise<void> {
    await this.repository.delete({ expiresAt: LessThan(new Date()) });
  }
}
