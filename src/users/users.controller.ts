import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { UsersService } from './users.service';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UserRole, UserStatus } from 'src/common/enums';
import { Roles } from 'src/common/decorators/role.decorator';
import { GetUsersDto } from './dto/get-users.dto';
import { get } from 'http';

@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Put('me')
  @UseGuards(JwtAuthGuard)
  updateMe(@CurrentUser() user: User, @Body() dto: UpdateUserDto) {
    return this.usersService.updateCurrentUser(user.id, dto);
  }

  @Put('/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  updateUserStatus(@Body() dto: UpdateUserStatusDto) {
    return this.usersService.updateUserStatus(dto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  getUserById(@Param('id') id: string) {
    return this.usersService.getUserById(id);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  getAllUsers(@Query() getUsersDto: GetUsersDto) {
    return this.usersService.findAll(getUsersDto);
  }

  @Delete()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  deleteUser(@Param('id') userId: string) {
    return this.usersService.deleteUser(userId);
  }
}
