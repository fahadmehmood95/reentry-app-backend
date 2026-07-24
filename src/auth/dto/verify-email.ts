// auth/dto/verify-reset-code.dto.ts

import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class VerifiyEmailDto {
  @IsEmail()
  email!: string;

  @IsString()
  @Length(6, 6)
  @IsNotEmpty()
  code!: string;
}
