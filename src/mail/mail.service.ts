import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendPasswordResetCode(
    email: string,
    firstName: string,
    code: string,
  ): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Password Reset Code',
      html: `
        <h2>Hello ${firstName},</h2>

        <p>Your password reset code is:</p>

        <h1>${code}</h1>

        <p>This code will expire in 10 minutes.</p>

        <p>If you didn't request this, please ignore this email.</p>
      `,
    });
  }

  async sendEmailVerificationCode(
    email: string,
    firstName: string,
    code: string,
  ): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Verify Your Email',
      html: `
        <h2>Hello ${firstName},</h2>

        <p>Your verification code is:</p>

        <h1>${code}</h1>
      `,
    });
  }

  async sendCoachEmail(
    email: string,
    firstName: string,
    status: string,
  ): Promise<void> {
    const message =
      status === 'ACTIVE'
        ? `<p>Your account has been <strong>activated</strong> successfully. You may now log in to your account.</p>`
        : `<p>Due to some reasons, your account has been <strong>deactivated</strong> by the admin. Kindly contact the administrator for further assistance.</p>`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Account Status Changed',
      html: `
      <h2>Hello ${firstName},</h2>
      ${message}
    `,
    });
  }

  async sendWelcomeEmail(email: string, firstName: string): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Welcome to Reentry',
      html: `
        <h2>Welcome ${firstName}!</h2>

        <p>Your account has been created successfully.</p>
      `,
    });
  }
}
