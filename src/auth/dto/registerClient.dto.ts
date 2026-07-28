import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsString, IsUrl } from 'class-validator';

import { BaseRegisterDto } from './base-dto';
import { Column } from 'typeorm';

export class RegisterClientDto extends BaseRegisterDto {
  @ApiProperty({
    example: '2026-07-22',
  })
  @IsDateString()
  releaseDate!: Date;

  @ApiProperty({
    example: 'https://my-bucket.s3.amazonaws.com/resume.pdf',
  })
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  resumeUrl!: string;

  @ApiProperty({
    example: 'https://my-bucket.s3.amazonaws.com/id-card.pdf',
  })
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  idCardUrl!: string;
}
