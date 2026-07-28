import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { DocumentsService } from './documents.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { File as MulterFile } from 'multer';
import { UploadDocumentDto } from './dto/upload.documents.dto';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  uploadDocuments(@Body() uploadDocumentsDto: UploadDocumentDto) {
    return this.documentsService.uploadDocuments(uploadDocumentsDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  getDocuments(@Param('userId') userId: string) {
    return this.documentsService.getDocuments(userId);
  }
}
