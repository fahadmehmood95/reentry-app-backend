import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

import { BaseRegisterDto } from './base-dto';

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
  @IsInt()
  @Min(0)
  experience!: number;

  @ApiProperty({
    example: 'PK-PSY-123456',
  })
  @IsString()
  @IsNotEmpty()
  licenseNumber!: string;
}
