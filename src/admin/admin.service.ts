import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DashboardResponseDto } from './dto/dashboard-response.dto';
import { ApiResponse } from 'src/common/responses/api-response';
import { ResponseHelper } from 'src/common/helpers/reponse-helpers';
import { AdminRepository } from './repositroy/admin.respository';
import { UpdateUserStatusDto } from './dto/udate-coach-status.dto';
import { UserRepository } from 'src/users/repository/user.repository';
import { UserRole, UserStatus } from 'src/common/enums';
import { MailService } from 'src/mail/mail.service';
import { User } from 'src/users/entities/user.entity';
import { GetUsersDto } from 'src/users/dto/get-users.dto';
import { PaginatedResponseDto } from 'src/common/responses/paginated.response.dto';
import { AssignCoachDto, CoachAssignmentAction } from './dto/assign-coach.dto';

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

  public async CoachAssignmentActions(dto: AssignCoachDto) {
    const client = await this.userRepository.findById(dto.clientId);
    const coach = await this.userRepository.findById(dto.coachId);
    if (!client) {
      throw new NotFoundException('Client not found.');
    }
    if (client.role !== UserRole.CLIENT) {
      throw new BadRequestException('User is not a client.');
    }
    if (!coach) {
      throw new NotFoundException('Coach not found.');
    }
    if (coach.role !== UserRole.COACH) {
      throw new BadRequestException('User is not a coach.');
    }
    if (client.coachId) {
      throw new BadRequestException('Client already has a coach.');
    }

    if (dto.action === CoachAssignmentAction.ASSIGN) {
      this.AssignCoach(coach, client);
    } else {
      this.unassignCoach(client);
    }
  }

  private async unassignCoach(client: User) {
    if (!client.coachId) {
      throw new BadRequestException('Client has no assigned coach.');
    }

    client.coachId = null;

    await this.userRepository.update(client);

    return ResponseHelper.success('Coach unassigned successfully.');
  }
  private async AssignCoach(coach: User, client: User) {
    client.coachId = coach.id;
    await this.userRepository.update(client);
    return ResponseHelper.success('Coach assigned successfully.');
  }
  public async getCoaches(
    dto: GetUsersDto,
  ): Promise<ApiResponse<PaginatedResponseDto<GetUsersDto>>> {
    const coaches = await this.respository.findUsers(dto, UserRole.COACH);
    return ResponseHelper.success('Coaches fetched successfully.', coaches);
  }

  public async getClients(
    dto: GetUsersDto,
  ): Promise<ApiResponse<PaginatedResponseDto<GetUsersDto>>> {
    const clients = await this.respository.findUsers(dto, UserRole.CLIENT);
    return ResponseHelper.success('Clients fetched successfully.', clients);
  }

  public async updateClientStatus(id: string, dto: UpdateUserStatusDto) {
    const client = await this.respository.findById(id);
    if (!client) {
      throw new NotFoundException('Client not found.');
    }
    client.status = dto.status;
    await this.respository.update(client);
    return ResponseHelper.success('User status updated successfully.');
  }

  public async updateCoachStatus(
    id: string,
    dto: UpdateUserStatusDto,
  ): Promise<ApiResponse<null>> {
    const coach = await this.respository.findById(id);

    if (!coach) {
      throw new NotFoundException('Coach not found.');
    }

    if (coach.role !== UserRole.COACH) {
      throw new BadRequestException('User is not a coach.');
    }

    coach.status = dto.status;

    await this.respository.update(coach);

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
