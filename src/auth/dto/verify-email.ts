// auth/dto/verify-reset-code.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class VerifiyEmailDto {
  @ApiProperty({
    example: 'john@example.com',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: '324456',
  })
  @IsString()
  @Length(6, 6)
  @IsNotEmpty()
  code!: string;
}
