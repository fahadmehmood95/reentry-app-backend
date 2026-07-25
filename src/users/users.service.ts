import { Injectable } from '@nestjs/common';
import { UserRepository } from './repository/user.repository';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { GetUsersDto } from './dto/get-users.dto';
import { PaginatedResponseDto } from 'src/common/responses/paginated.response.dto';
import { ResponseHelper } from 'src/common/helpers/reponse-helpers';
import { ApiResponse } from 'src/common/responses/api-response';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';

@Injectable()
export class UsersService {
  repository: any;
  constructor(private readonly userRepository: UserRepository) {}

  public async updateCurrentUser(
    id: string,
    user: UpdateUserDto,
  ): Promise<ApiResponse<UserResponseDto>> {
    const userToUpdate = await this.userRepository.findById(id);
    if (!userToUpdate) {
      throw new Error('User not found');
    }
    const updatedUser = { ...userToUpdate, ...user };
    this.userRepository.update(updatedUser);

    return ResponseHelper.success('User updated successfully.', updatedUser);
  }

  public async findAll(
    dto: GetUsersDto,
  ): Promise<ApiResponse<PaginatedResponseDto<UserResponseDto>>> {
    const { page = '1', limit = '10', role, status, search } = dto;

    const query = this.repository.createQueryBuilder('user');

    if (role) {
      query.andWhere('user.role = :role', { role });
    }

    if (status) {
      query.andWhere('user.status = :status', { status });
    }

    if (search) {
      query.andWhere(
        `(LOWER(user.firstName) LIKE LOWER(:search)
      OR LOWER(user.lastName) LIKE LOWER(:search)
      OR LOWER(user.email) LIKE LOWER(:search))`,
        {
          search: `%${search}%`,
        },
      );
    }

    query
      .skip((Number(page) - 1) * Number(limit))
      .take(Number(limit))
      .orderBy('user.createdAt', 'DESC');

    const [users, total] = await query.getManyAndCount();

    return ResponseHelper.success('Users fetched successfully.', users);
  }

  public async getUserById(id: string): Promise<ApiResponse<UserResponseDto>> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    return ResponseHelper.success('Users fetched successfully.', user);
  }

  public async deleteUser(userId: string): Promise<ApiResponse<null>> {
    await this.userRepository.delete(userId);
    return ResponseHelper.success('User deleted successfully.');
  }

  public async updateUserStatus(
    dto: UpdateUserStatusDto,
  ): Promise<ApiResponse<UserResponseDto>> {
    const user = await this.userRepository.findById(dto.userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.status = dto.status;
    this.userRepository.update(user);
    return ResponseHelper.success('User status updated successfully.', user);
  }
}
