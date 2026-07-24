import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

import { UsersModule } from '../users/users.module';
import { MailModule } from '../mail/mail.module';
import { StringValue } from 'ms'; // only if you want the exact type; optiona
import { RefreshTokenRepository } from './repository/refresh-token-repository';
import { VerificationTokenRepository } from './repository/verficiaiton.token.repository';

@Module({
  imports: [
    ConfigModule,

    PassportModule.register({
      defaultStrategy: 'jwt',
    }),

    JwtModule.registerAsync({
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: (config.get<string>('JWT_EXPIRES_IN') ??
            '3600s') as StringValue,
        },
      }),
      inject: [ConfigService],
    }),

    UsersModule,
    MailModule,
  ],

  controllers: [AuthController],

  providers: [AuthService, JwtStrategy],

  exports: [
    JwtModule,
    PassportModule,
    RefreshTokenRepository,
    VerificationTokenRepository,
  ],
})
export class AuthModule {}
