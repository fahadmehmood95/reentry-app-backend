import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

import { UserStatus } from '../../common/enums';

export class UpdateUserStatusDto {
  @ApiProperty({
    type: String,
  })
  userId!: string;

  @ApiProperty({
    enum: UserStatus,
  })
  @IsEnum(UserStatus)
  status!: UserStatus;
}
