import { Injectable } from '@nestjs/common';
import { UserRepository } from './repository/user.repository';
import { UserResponseDto } from './dto/user-response.dto';
import { ResponseHelper } from 'src/common/helpers/reponse-helpers';
import { ApiResponse } from 'src/common/responses/api-response';
import { ChangePasswordDto } from 'src/auth/dto/change-password.dto';
import * as bcrypt from 'bcrypt';
import { UpdateClientDto } from './dto/update-client-dto';
import { UpdateCoachDto } from './dto/update-coach-dto';

@Injectable()
export class UsersService {
  repository: any;
  constructor(private readonly userRepository: UserRepository) {}

  public async updateClientUser(
    id: string,
    user: UpdateClientDto,
  ): Promise<ApiResponse<UserResponseDto>> {
    const userToUpdate = await this.userRepository.findById(id);
    if (!userToUpdate) {
      throw new Error('User not found');
    }
    const updatedUser = { ...userToUpdate, ...user };
    this.userRepository.update(updatedUser);

    return ResponseHelper.success('User updated successfully.', updatedUser);
  }

  public async updateCoachUser(
    id: string,
    user: UpdateCoachDto,
  ): Promise<ApiResponse<UserResponseDto>> {
    const userToUpdate = await this.userRepository.findById(id);
    if (!userToUpdate) {
      throw new Error('User not found');
    }
    const updatedUser = { ...userToUpdate, ...user };
    this.userRepository.update(updatedUser);

    return ResponseHelper.success('User updated successfully.', updatedUser);
  }

  public async notifications() {
    return ResponseHelper.success('Notifications fetched successfully.');
  }

  public async changePassword(id: string, dto: ChangePasswordDto) {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new Error('User not found.');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw new Error('Old password is incorrect.');
    }

    // Hash the new password (unless you're already hashing it in an entity hook)
    user.password = await bcrypt.hash(dto.newPassword, 10);

    await this.userRepository.update(user);

    return ResponseHelper.success('Password updated successfully.');
  }

  public async getUserById(id: string): Promise<ApiResponse<UserResponseDto>> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    return ResponseHelper.success('Users fetched successfully.', user);
  }
}
