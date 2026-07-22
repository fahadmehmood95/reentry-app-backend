import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CoachProfile } from '../entity/coach.profile.entity';

@Injectable()
export class CoachProfileRepository {
  constructor(
    @InjectRepository(CoachProfile)
    private readonly repository: Repository<CoachProfile>,
  ) {}

  async create(coachProfile: Partial<CoachProfile>) {
    const entity = this.repository.create(coachProfile);
    return this.repository.save(entity);
  }

  async findByUserId(userId: string) {
    return this.repository.findOne({
      where: { user: { id: userId } },
    });
  }

  async update(profile: CoachProfile) {
    return this.repository.save(profile);
  }
}
