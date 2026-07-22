import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ClientProfile } from '../entity/client.profile.entity';

@Injectable()
export class ClientProfileRepository {
  constructor(
    @InjectRepository(ClientProfile)
    private readonly repository: Repository<ClientProfile>,
  ) {}

  async create(clientProfile: Partial<ClientProfile>) {
    const entity = this.repository.create(clientProfile);
    return this.repository.save(entity);
  }

  async findByUserId(userId: string) {
    return this.repository.findOne({
      where: { user: { id: userId } },
    });
  }

  async update(profile: ClientProfile) {
    return this.repository.save(profile);
  }
}
