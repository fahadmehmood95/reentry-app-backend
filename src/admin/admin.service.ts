import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DashboardResponseDto } from './dto/dashboard-response.dto';
import { ApiResponse } from 'src/common/responses/api-response';
import { ResponseHelper } from 'src/common/helpers/reponse-helpers';
import { AdminRepository } from './repositroy/Admin.respository';
import { UpdateCoachStatusDto } from './dto/udate-coach-status.dto';
import { UserRepository } from 'src/users/repository/user.repository';
import { UserRole, UserStatus } from 'src/common/enums';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly respository: AdminRepository,
    private readonly mailService: MailService,
    private readonly userRepository: UserRepository,
  ) {}
  public async getDashboard(): Promise<ApiResponse<DashboardResponseDto>> {
    const dashboard = await this.respository.getDashboard();
    return ResponseHelper.success('Dashboard fetched successfully.', dashboard);
  }

  public async updateCoachStatus(
    id: string,
    dto: UpdateCoachStatusDto,
  ): Promise<ApiResponse<null>> {
    const coach = await this.userRepository.findById(id);

    if (!coach) {
      throw new NotFoundException('Coach not found.');
    }

    if (coach.role !== UserRole.COACH) {
      throw new BadRequestException('User is not a coach.');
    }

    coach.status = dto.status;

    await this.userRepository.update(coach);

    if (dto.status === UserStatus.ACTIVE) {
      await this.mailService.sendCoachEmail(
        coach.email,
        coach.firstName,
        dto.status,
      );
    }

    return ResponseHelper.success(
      `Coach ${dto.status === UserStatus.ACTIVE ? 'approved' : 'rejected'} successfully.`,
    );
  }
}
