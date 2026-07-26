import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

import { UserStatus } from '../../common/enums';

export class UpdateUserStatusDto {
  @ApiProperty({
    enum: [UserStatus.ACTIVE, UserStatus.INACTIVE],
  })
  @IsEnum([UserStatus.ACTIVE, UserStatus.INACTIVE])
  status!: UserStatus;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  reason?: string;
}
