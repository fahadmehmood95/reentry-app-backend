import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { ProfilesModule } from './profiles/profiles.module';
import { DocumentsModule } from './documents/documents.module';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',

        host: config.get<string>('DB_HOST'),

        port: Number(config.get('DB_PORT')),

        username: config.get<string>('DB_USERNAME'),

        password: config.get<string>('DB_PASSWORD'),

        database: config.get<string>('DB_DATABASE'),

        autoLoadEntities: true,

        synchronize: false,

        logging: true,
      }),
    }),

    UsersModule,

    ProfilesModule,

    DocumentsModule,

    AuthModule,

    MailModule,
  ],
})
export class AppModule {}
