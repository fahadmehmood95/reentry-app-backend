import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import ms, { StringValue } from 'ms';

import { LoginDto } from './dto/login.dto';
import { User } from '../users/entities/user.entity';
import { UserRepository } from '../users/repository/user.repository';
import { UserStatus } from '../common/enums';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { RefreshTokenDto } from './dto/refresh.dto';
import { MailService } from 'src/mail/mail.service';
import { ForgotPasswordDto } from './dto/forget-password.dto';
import { VerifyResetCodeDto } from './dto/verify-reset-code';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { BaseRegisterDto } from './dto/base-dto';
import { UserRole } from 'src/common/enums';
import { RegisterClientDto } from './dto/registerClient.dto';
import { ClientProfileRepository } from 'src/profiles/repository/clientprofile.repository';
import { RegisterCoachDto } from './dto/registerCoach.dto';
import { CoachProfileRepository } from 'src/profiles/repository/coachprofile.repository';
import { ApiResponse } from '../common/responses/api-response';
import { RefreshTokenRepository } from './repository/refresh-token-repository';
import { VerificationTokenRepository } from './repository/verficiaiton.token.repository';
import { VerificationTokenType } from './entity/verification-token.entity';

interface DeviceInfo {
  userAgent?: string | null;
  ip?: string | null;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
    private readonly clientProfileRepository: ClientProfileRepository,
    private readonly coachProfileRepository: CoachProfileRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly verificationTokenRepository: VerificationTokenRepository,
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
      releaseDate: registerClientDto.releaseDate,
      resume: registerClientDto.resume,
      idCard: registerClientDto.idCard,
    });

    const code = this.generateResetCode();

    await this.verificationTokenRepository.create({
      userId: user.id,
      type: VerificationTokenType.EMAIL_VERIFICATION,
      codeHash: await this.hashData(code),
      expiresAt: new Date(Date.now() + 3600000), // 1 hour
    });

    try {
      await this.mailService.sendEmailVerificationCode(
        user.email,
        user.firstName,
        code,
      );
    } catch (err) {
      // log it, maybe queue a retry, but don't fail registration
      console.error('Failed to send verification email:', err);
    }

    return new ApiResponse(
      true,
      'Client Registered Successfully, code sent to your email kindly verify.',
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

  private async hashData(data: string): Promise<string> {
    return bcrypt.hash(data, 10);
  }

  private getExpiryMs(configKey: string, fallback: StringValue): number {
    const raw = this.configService.get<StringValue>(configKey) ?? fallback;
    return ms(raw);
  }

  // Signs a fresh access + refresh token pair and persists the refresh
  // token as its own row (hashed), so a user can be logged in from
  // multiple devices and each session can be revoked independently.
  private async issueTokens(user: User, deviceInfo?: DeviceInfo) {
    const jti = randomUUID();

    const basePayload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(basePayload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: this.configService.get<StringValue>('JWT_EXPIRES_IN'),
      }),

      this.jwtService.signAsync(
        { ...basePayload, jti },
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: this.configService.get<StringValue>(
            'JWT_REFRESH_EXPIRES_IN',
          ),
        },
      ),
    ]);

    const expiresAt = new Date(
      Date.now() + this.getExpiryMs('JWT_REFRESH_EXPIRES_IN', '7d'),
    );

    await this.refreshTokenRepository.create({
      userId: user.id,
      jti,
      tokenHash: await this.hashData(refreshToken),
      expiresAt,
      userAgent: deviceInfo?.userAgent ?? null,
      ip: deviceInfo?.ip ?? null,
    });

    return { accessToken, refreshToken };
  }

  private async verifyRefreshToken(token: string): Promise<JwtPayload> {
    return this.jwtService.verifyAsync<JwtPayload>(token, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
    });
  }

  public refreshToken = async (
    refreshTokenDto: RefreshTokenDto,
    deviceInfo?: DeviceInfo,
  ) => {
    const { refreshToken } = refreshTokenDto;

    // Verify JWT signature/expiry first (cheap, no DB hit needed).
    const payload = await this.verifyRefreshToken(refreshToken);

    if (!payload.jti) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // O(1) lookup of the exact session instead of comparing against
    // every refresh token the user has ever issued.
    const storedToken = await this.refreshTokenRepository.findByJti(
      payload.jti,
    );

    if (
      !storedToken ||
      storedToken.revokedAt ||
      storedToken.expiresAt < new Date()
    ) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const isValid = await bcrypt.compare(refreshToken, storedToken.tokenHash);

    if (!isValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.userRepository.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Rotation: kill the token that was just used, then issue a new
    // pair. Prevents a leaked (and now-used) refresh token from being
    // replayed even if it hasn't technically expired yet.
    await this.refreshTokenRepository.revokeByJti(payload.jti);

    const { accessToken, refreshToken: newRefreshToken } =
      await this.issueTokens(user, deviceInfo);

    return new ApiResponse(true, 'Token refreshed successfully.', {
      accessToken,
      refreshToken: newRefreshToken,
    });
  };

  public verifyEmail = async (email: string, code: string) => {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or code.');
    }

    const token = await this.verificationTokenRepository.findActive(
      user.id,
      VerificationTokenType.EMAIL_VERIFICATION,
    );

    if (!token) {
      throw new UnauthorizedException('Invalid or expired code.');
    }

    const isValid = await bcrypt.compare(code, token.codeHash);

    if (!isValid) {
      throw new UnauthorizedException('Invalid code.');
    }

    await this.verificationTokenRepository.markConsumed(token.id);

    if (user.status === UserStatus.PENDING) {
      user.status = UserStatus.ACTIVE;
      await this.userRepository.update(user);
    }

    return new ApiResponse(true, 'Email verified successfully.', null);
  };

  public login = async (loginDto: LoginDto, deviceInfo?: DeviceInfo) => {
    const user = await this.validateUser(loginDto);
    const { accessToken, refreshToken } = await this.issueTokens(
      user,
      deviceInfo,
    );

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

  // If a refresh token is provided, only that session is logged out.
  // Otherwise every session for the user is revoked (old behaviour).
  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      try {
        const payload = await this.verifyRefreshToken(refreshToken);
        if (payload.jti) {
          await this.refreshTokenRepository.revokeByJti(payload.jti);
          return new ApiResponse(true, 'Logged out successfully.', null);
        }
      } catch {
        // Token already invalid/expired — fall through and revoke
        // everything for the user as a safe default.
      }
    }

    await this.refreshTokenRepository.revokeAllForUser(userId);

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

    // Kill any earlier unused reset codes so only the latest one works.
    await this.verificationTokenRepository.invalidateActive(
      user.id,
      VerificationTokenType.PASSWORD_RESET,
    );

    const code = this.generateResetCode();

    await this.verificationTokenRepository.create({
      userId: user.id,
      type: VerificationTokenType.PASSWORD_RESET,
      codeHash: await this.hashData(code),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
    });

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

    const token = await this.verificationTokenRepository.findActive(
      user.id,
      VerificationTokenType.PASSWORD_RESET,
    );

    if (!token) {
      throw new BadRequestException('Invalid or expired code.');
    }

    const isValid = await bcrypt.compare(resetPasswordDto.code, token.codeHash);

    if (!isValid) {
      throw new BadRequestException('Invalid code.');
    }

    await this.verificationTokenRepository.markConsumed(token.id);

    user.password = await bcrypt.hash(resetPasswordDto.newPassword, 10);

    await this.userRepository.update(user);

    // Password reset should log the user out everywhere, same as a
    // regular password change.
    await this.refreshTokenRepository.revokeAllForUser(user.id);

    return new ApiResponse(true, 'Password reset successfully.', null);
  };

  public verifyResetCode = async (dto: VerifyResetCodeDto) => {
    const user = await this.userRepository.findByEmail(dto.email);

    if (!user) {
      throw new BadRequestException('Invalid code.');
    }

    const token = await this.verificationTokenRepository.findActive(
      user.id,
      VerificationTokenType.PASSWORD_RESET,
    );

    if (!token) {
      throw new BadRequestException('Code has expired.');
    }

    const isValid = await bcrypt.compare(dto.code, token.codeHash);

    if (!isValid) {
      throw new BadRequestException('Invalid code.');
    }

    // Deliberately not consumed here — resetPassword() consumes it.
    // This endpoint only checks validity so the UI can show a
    // "code accepted" step before the user sets a new password.
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

    await this.userRepository.update(user);

    // Logout all devices
    await this.refreshTokenRepository.revokeAllForUser(user.id);

    return new ApiResponse(true, 'Password changed successfully.', null);
  };
}
