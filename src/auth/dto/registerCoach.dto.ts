import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

import { BaseRegisterDto } from './base-dto';
import { Column } from 'typeorm';

export class RegisterCoachDto extends BaseRegisterDto {
  @ApiProperty({
    example: 'Clinical Psychology',
  })
  @IsString()
  @IsNotEmpty()
  specialization!: string;

  @ApiProperty({
    example: 'Master of Clinical Psychology',
  })
  @IsString()
  @IsNotEmpty()
  qualification!: string;

  @ApiProperty({
    example: 5,
    description: 'Years of professional experience',
  })
  @ApiProperty({
    example: 'https://my-bucket.s3.amazonaws.com/resume.pdf',
  })
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  resumeUrl!: string;

  @ApiProperty({
    example: 'https://my-bucket.s3.amazonaws.com/experience-letter.pdf',
  })
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  experienceLetter!: string;
}
