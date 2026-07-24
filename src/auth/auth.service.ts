import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { LoginDto } from './dto/login.dto';
import { User } from '../users/entities/user.entity';
import { UserRepository } from '../users/repository/user.repository';
import { UserStatus } from '../common/enums';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { ConfigService } from '@nestjs/config';
import { StringValue } from 'ms'; // only if you want the exact type; optiona
import { RefreshTokenDto } from './dto/refresh.dto';
import { MailService } from 'src/mail/mail.service';
import { ForgotPasswordDto } from './dto/forget-password.dto';
import { VerifyResetCodeDto } from './dto/verify-reset-code';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { BaseRegisterDto } from './dto/base-dto';
import { UserRole } from 'generated/prisma/enums';
import { RegisterClientDto } from './dto/registerClient.dto';
import { ClientProfileRepository } from 'src/profiles/repository/clientprofile.repository';
import { RegisterCoachDto } from './dto/registerCoach.dto';
import { CoachProfileRepository } from 'src/profiles/repository/coachprofile.repository';
import { ApiResponse } from '../common/responses/api-response';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
    private readonly clientProfileRepository: ClientProfileRepository,
    private readonly coachProfileRepository: CoachProfileRepository,
  ) {}

  private async validateUser(loginDto: LoginDto): Promise<User> {
    const { email, password } = loginDto;

    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password.');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new ForbiddenException(
        'Your account is not active. Please contact admin.',
      );
    }

    return user;
  }

  private async createUser(
    dto: BaseRegisterDto,
    role: UserRole,
    status: UserStatus,
  ): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(dto.email);

    if (existingUser) {
      throw new ConflictException('Email already exists.');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    return this.userRepository.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      password: hashedPassword,
      phoneNumber: dto.phoneNumber,
      role: role as UserRole,
      status,
    });
  }

  public registerClient = async (registerClientDto: RegisterClientDto) => {
    const user = await this.createUser(
      registerClientDto,
      UserRole.CLIENT,
      UserStatus.PENDING,
    );

    await this.clientProfileRepository.create({
      user,
    });

    const token = await this.generateResetCode();
    const hashedToken = await this.hashData(token);

    user.emailVerificationCodeHash = hashedToken;
    user.emailVerificationExpiresAt = new Date(Date.now() + 3600000);

    await this.userRepository.update(user);

    await this.mailService.sendEmailVerificationCode(
      user.email,
      user.firstName,
      hashedToken,
    );

    return new ApiResponse(
      true,
      'Client Registered Successfully, token sent to your email kindly verify.',
      {
        user,
      },
    );
  };

  public registerCoach = async (registerCoachDto: RegisterCoachDto) => {
    const user = await this.createUser(
      registerCoachDto,
      UserRole.COACH,
      UserStatus.PENDING,
    );

    await this.coachProfileRepository.create({
      user,
    });

    return new ApiResponse(
      true,
      'Registration submitted successfully. Your account is awaiting admin approval.',
      null,
    );
  };

  private async generateTokens(user: User) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: this.configService.get<StringValue>('JWT_EXPIRES_IN'),
      }),

      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<StringValue>(
          'JWT_REFRESH_EXPIRES_IN',
        ),
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  private async updateRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new UnauthorizedException();
    }

    user.refreshTokenHash = await this.hashData(refreshToken);

    await this.userRepository.update(user);
  }

  private async hashData(data: string): Promise<string> {
    return bcrypt.hash(data, 10);
  }

  private async verifyRefreshToken(token: string): Promise<JwtPayload> {
    return this.jwtService.verifyAsync<JwtPayload>(token, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
    });
  }

  public refreshToken = async (refreshTokenDto: RefreshTokenDto) => {
    const { refreshToken } = refreshTokenDto;

    // Verify JWT
    const payload = await this.verifyRefreshToken(refreshToken);

    // Find user
    const user = await this.userRepository.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // User must still have a refresh token
    if (!user.refreshTokenHash) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Compare incoming token with hashed token in DB
    const isValid = await bcrypt.compare(refreshToken, user.refreshTokenHash);

    if (!isValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Generate new tokens (rotation)
    const { accessToken, refreshToken: newRefreshToken } =
      await this.generateTokens(user);

    // Save new refresh token hash
    await this.updateRefreshToken(user.id, newRefreshToken);

    return new ApiResponse(true, 'Token refreshed successfully.', {
      accessToken,
      refreshToken: newRefreshToken,
    });
  };

  public verifyEmail = async (email: string, token: string) => {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or token.');
    }
    if (!user.emailVerificationCodeHash) {
      throw new UnauthorizedException('Invalid token.');
    }

    const isTokenValid = await bcrypt.compare(
      token,
      user.emailVerificationCodeHash,
    );
    if (!isTokenValid) {
      throw new UnauthorizedException('Invalid token.');
    }
    user.emailVerificationCodeHash = null;
    user.emailVerificationExpiresAt = null;
    await this.userRepository.update(user);
    return new ApiResponse(true, 'Email verified successfully.', null);
  };

  public login = async (loginDto: LoginDto) => {
    const user = await this.validateUser(loginDto);
    const { accessToken, refreshToken } = await this.generateTokens(user);
    await this.updateRefreshToken(user.id, refreshToken);

    return new ApiResponse(true, 'Login successful.', {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        status: user.status,
      },
    });
  };

  async logout(userId: string) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new UnauthorizedException();
    }

    user.refreshTokenHash = null;

    await this.userRepository.update(user);

    return new ApiResponse(true, 'Logged out successfully.', null);
  }

  private generateResetCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  public forgotPassword = async (forgotPasswordDto: ForgotPasswordDto) => {
    const user = await this.userRepository.findByEmail(forgotPasswordDto.email);

    // Never reveal whether the email exists
    if (!user) {
      return new ApiResponse(
        true,
        'If an account exists with this email, a reset code has been sent.',
        null,
      );
    }

    const code = this.generateResetCode();

    user.passwordResetCodeHash = await bcrypt.hash(code, 10);

    user.passwordResetExpiresAt = new Date(
      Date.now() + 5 * 60 * 1000, // 15 minutes
    );

    await this.userRepository.update(user);

    await this.mailService.sendPasswordResetCode(
      user.email,
      user.firstName,
      code,
    );

    return new ApiResponse(
      true,
      'Reset code has been sent to your email.',
      null,
    );
  };

  public resetPassword = async (resetPasswordDto: ResetPasswordDto) => {
    const user = await this.userRepository.findByEmail(resetPasswordDto.email);

    if (!user) {
      throw new BadRequestException('Invalid email');
    }

    const isValid = await bcrypt.compare(
      resetPasswordDto.code,
      user.passwordResetCodeHash!,
    );

    if (!isValid) {
      throw new BadRequestException('Invalid code.');
    }

    user.password = resetPasswordDto.newPassword;

    await this.userRepository.update(user);

    return new ApiResponse(true, 'Password reset successfully.', null);
  };

  public verifyResetCode = async (dto: VerifyResetCodeDto) => {
    const user = await this.userRepository.findByEmail(dto.email);

    if (!user) {
      throw new BadRequestException('Invalid code.');
    }

    if (
      !user.passwordResetExpiresAt ||
      user.passwordResetExpiresAt < new Date()
    ) {
      throw new BadRequestException('Code has expired.');
    }

    const isValid = await bcrypt.compare(dto.code, user.passwordResetCodeHash!);

    if (!isValid) {
      throw new BadRequestException('Invalid code.');
    }

    return new ApiResponse(true, 'Code verified successfully.', null);
  };

  public changePassword = async (
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ) => {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found.');
    }

    const isPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect.');
    }

    const isSamePassword = await bcrypt.compare(
      changePasswordDto.newPassword,
      user.password,
    );

    if (isSamePassword) {
      throw new BadRequestException(
        'New password must be different from current password.',
      );
    }

    user.password = await bcrypt.hash(changePasswordDto.newPassword, 10);

    // Logout all devices
    user.refreshTokenHash = null;

    await this.userRepository.update(user);

    return new ApiResponse(true, 'Password changed successfully.', null);
  };
}
