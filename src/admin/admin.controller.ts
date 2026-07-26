import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Roles } from 'src/common/decorators/role.decorator';
import { UserRole } from 'src/common/enums';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { AdminService } from './admin.service';
import { UpdateUserStatusDto } from './dto/udate-coach-status.dto';
import { GetUsersDto } from 'src/users/dto/get-users.dto';
import { AssignCoachDto } from './dto/assign-coach.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}
  @Get('dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  getDashboard() {
    return this.adminService.getDashboard();
  }

  @Post('assign-coach')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  assignCoachAction(@Body() dto: AssignCoachDto) {
    return this.adminService.getDashboard();
  }

  @Get('coaches')
  getCoaches(@Query() dto: GetUsersDto) {
    return this.adminService.getCoaches(dto);
  }

  @Get('clients')
  getClients(@Query() dto: GetUsersDto) {
    return this.adminService.getClients(dto);
  }

  @Patch('client/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  updateClientStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserStatusDto,
  ) {
    return this.adminService.updateClientStatus(id, dto);
  }

  @Patch('coach/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  updateCoachStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserStatusDto,
  ) {
    return this.adminService.updateCoachStatus(id, dto);
  }
}
