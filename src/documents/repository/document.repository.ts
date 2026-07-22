import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Document } from '../entity/documents.entity';

@Injectable()
export class DocumentRepository {
  constructor(
    @InjectRepository(Document)
    private readonly repository: Repository<Document>,
  ) {}

  async create(document: Partial<Document>) {
    const entity = this.repository.create(document);
    return this.repository.save(entity);
  }

  async createMany(documents: Partial<Document>[]) {
    const entities = this.repository.create(documents);
    return this.repository.save(entities);
  }

  async findByUserId(userId: string) {
    return this.repository.find({
      where: { userId },
    });
  }

  async delete(id: string) {
    return this.repository.delete(id);
  }
}
