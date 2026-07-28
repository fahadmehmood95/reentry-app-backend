import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumberString, IsOptional } from 'class-validator';

import { DocumentType } from '../entity/documents.entity';

export class GetDocumentsDto {
  @ApiPropertyOptional({
    example: '1',
  })
  @IsOptional()
  @IsNumberString()
  page?: string = '1';

  @ApiPropertyOptional({
    example: '10',
  })
  @IsOptional()
  @IsNumberString()
  limit?: string = '10';

  @ApiPropertyOptional({
    example: '9f7e6d32-0a8b-4f59-8d4e-5d5b8b4d9f71',
    name: 'userId',
    nullable: false,
  })
  userId!: string;

  @ApiPropertyOptional({
    enum: DocumentType,
  })
  @IsOptional()
  @IsEnum(DocumentType)
  type?: DocumentType;
}
