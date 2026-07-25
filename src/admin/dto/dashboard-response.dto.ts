import { ApiProperty } from '@nestjs/swagger';

export class DashboardResponseDto {
  @ApiProperty()
  totalUsers!: number;

  @ApiProperty()
  totalClients!: number;

  @ApiProperty()
  totalCoaches!: number;

  @ApiProperty()
  pendingClients!: number;

  @ApiProperty()
  pendingCoaches!: number;

  @ApiProperty()
  activeClients!: number;

  @ApiProperty()
  activeCoaches!: number;
}
