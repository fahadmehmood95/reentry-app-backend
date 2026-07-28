import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsUrl } from 'class-validator';

import { DocumentType } from '../entity/documents.entity';

export class UploadDocumentDto {
  @ApiProperty({
    example: '9f7e6d32-0a8b-4f59-8d4e-5d5b8b4d9f71',
  })
  userId!: string;

  @ApiProperty({
    enum: DocumentType,
    example: DocumentType.RESUME,
  })
  @IsEnum(DocumentType)
  type!: DocumentType;

  @ApiProperty({
    example: 'https://my-bucket.s3.amazonaws.com/resume.pdf',
  })
  @IsUrl()
  url!: string;
}
