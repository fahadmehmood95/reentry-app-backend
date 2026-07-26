import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { DeepPartial, Repository } from 'typeorm';
import { DashboardResponseDto } from '../dto/dashboard-response.dto';
import { UserRole, UserStatus } from 'src/common/enums';
import { GetUsersDto } from 'src/users/dto/get-users.dto';
import { PaginatedResponseDto } from 'src/common/responses/paginated.response.dto';

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

  async findUsers(
    dto: GetUsersDto,
    role: UserRole,
  ): Promise<PaginatedResponseDto<GetUsersDto>> {
    const { page = '1', limit = '10', search, status } = dto;

    const query = this.repository.createQueryBuilder('user');

    query.where('user.role = :role', { role });

    if (status) {
      query.andWhere('user.status = :status', {
        status,
      });
    }

    if (search) {
      query.andWhere(
        `(
        LOWER(user.firstName) LIKE LOWER(:search)
        OR LOWER(user.lastName) LIKE LOWER(:search)
        OR LOWER(user.email) LIKE LOWER(:search)
        OR user.phoneNumber LIKE :search
      )`,
        {
          search: `%${search}%`,
        },
      );
    }

    query
      .orderBy('user.createdAt', 'DESC')
      .skip((Number(page) - 1) * Number(limit))
      .take(Number(limit));

    const [items, total] = await query.getManyAndCount();

    return {
      items,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    };
  }

  async findAll(): Promise<User[]> {
    return this.repository.find();
  }

  async findById(id: string): Promise<User | null> {
    return this.repository.findOne({
      where: { id },
    });
  }

  async update(user: User): Promise<User> {
    return this.repository.save(user);
  }

  async delete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }
}
