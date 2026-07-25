import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { DashboardResponseDto } from '../dto/dashboard-response.dto';
import { UserRole, UserStatus } from 'src/common/enums';

@Injectable()
export class AdminRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  async getDashboard(): Promise<DashboardResponseDto> {
    const [
      totalUsers,
      totalClients,
      totalCoaches,
      pendingClients,
      pendingCoaches,
      activeClients,
      activeCoaches,
    ] = await Promise.all([
      this.repository.count(),

      this.repository.count({
        where: {
          role: UserRole.CLIENT,
        },
      }),

      this.repository.count({
        where: {
          role: UserRole.COACH,
        },
      }),

      this.repository.count({
        where: {
          role: UserRole.CLIENT,
          status: UserStatus.PENDING,
        },
      }),

      this.repository.count({
        where: {
          role: UserRole.COACH,
          status: UserStatus.PENDING,
        },
      }),

      this.repository.count({
        where: {
          role: UserRole.CLIENT,
          status: UserStatus.ACTIVE,
        },
      }),

      this.repository.count({
        where: {
          role: UserRole.COACH,
          status: UserStatus.ACTIVE,
        },
      }),
    ]);

    return {
      totalUsers,
      totalClients,
      totalCoaches,
      pendingClients,
      pendingCoaches,
      activeClients,
      activeCoaches,
    };
  }
}
