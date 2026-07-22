import { Module } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Document])],
  providers: [DocumentsService, DocumentRepository],
  controllers: [DocumentsController],
  exports: [DocumentRepository],
})
export class DocumentsModule {}
