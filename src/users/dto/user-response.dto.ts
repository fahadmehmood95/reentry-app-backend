import { ApiProperty } from '@nestjs/swagger';

import { UserRole, UserStatus } from '../../common/enums';

export class UserResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  firstName!: string;

  @ApiProperty()
  lastName!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  phoneNumber!: string;

  @ApiProperty({
    enum: UserRole,
  })
  role!: UserRole;

  @ApiProperty({
    enum: UserStatus,
  })
  status!: UserStatus;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
