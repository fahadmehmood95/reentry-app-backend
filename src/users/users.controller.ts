import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { User } from './entities/user.entity';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { UsersService } from './users.service';
import { ChangePasswordDto } from 'src/auth/dto/change-password.dto';
import { UpdateClientDto } from './dto/update-client-dto';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UserRole } from 'src/common/enums';
import { Roles } from 'src/common/decorators/role.decorator';

@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Put('client/me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENT)
  updateMeClient(@CurrentUser() user: User, @Body() dto: UpdateClientDto) {
    return this.usersService.updateClientUser(user.id, dto);
  }

  @Put('coach/me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENT)
  updateMeCoach(@CurrentUser() user: User, @Body() dto: UpdateClientDto) {
    return this.usersService.updateCoachUser(user.id, dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@CurrentUser() user: User) {
    return this.usersService.getUserById(user.id);
  }

  @Get('me/notifications')
  @UseGuards(JwtAuthGuard)
  getNotifications(@CurrentUser() user: User) {
    return this.usersService.notifications();
  }

  @Patch('change-password')
  @UseGuards(JwtAuthGuard)
  changePassword(@CurrentUser() user: User, @Body() dto: ChangePasswordDto) {
    return this.usersService.changePassword(user.id, dto);
  }
}
