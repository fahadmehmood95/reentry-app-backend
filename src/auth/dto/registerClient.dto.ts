import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

import { BaseRegisterDto } from './base-dto';

export class RegisterClientDto extends BaseRegisterDto {
  @ApiProperty({
    example: '2026-07-22',
  })
  @IsDateString()
  releaseDate!: Date;

  @ApiProperty({
    example: 'resume.pdf',
  })
  @IsString()
  @IsNotEmpty()
  resume!: string;

  @ApiProperty({
    example: 'id-card.pdf',
  })
  @IsString()
  @IsNotEmpty()
  idCard!: string;
}
