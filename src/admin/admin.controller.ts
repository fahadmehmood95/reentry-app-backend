import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Put,
  UseGuards,
} from '@nestjs/common';
import { Roles } from 'src/common/decorators/role.decorator';
import { UserRole } from 'src/common/enums';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { AdminService } from './admin.service';
import { UpdateCoachStatusDto } from './dto/udate-coach-status.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}
  @Get('dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  getDashboard() {
    return this.adminService.getDashboard();
  }

  @Patch('coaches/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  updateCoachStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCoachStatusDto,
  ) {
    return this.adminService.updateCoachStatus(id, dto);
  }
}
