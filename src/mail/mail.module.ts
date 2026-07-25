import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';

import { MailService } from './mail.service';

@Module({
  imports: [
    ConfigModule,

    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const pass = config.get<string>('MAIL_PASSWORD');
        const user = config.get<string>('MAIL_USER');
        const host = config.get<string>('MAIL_HOST');
        const port = config.get<number>('MAIL_PORT');

        console.log('MAIL DEBUG:', {
          user,
          pass: JSON.stringify(pass),
          passLength: pass?.length,
          host,
          port,
          portType: typeof port,
        });

        return {
          transport: {
            host,
            port: Number(port),
            secure: false,
            auth: { user, pass },
          },
          defaults: {
            from: config.get<string>('MAIL_FROM'),
          },
        };
      },
    }),
  ],

  providers: [MailService],

  exports: [MailService],
})
export class MailModule {}
