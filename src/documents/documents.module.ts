import { Module } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentRepository } from './repository/document.repository';
import { Document } from './entity/documents.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Document])],
  providers: [DocumentsService, DocumentRepository],
  controllers: [DocumentsController],
  exports: [DocumentRepository],
})
export class DocumentsModule {}
