import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { EdgeJsService } from 'nestjs-mvc-tools';
import { createTransport, Transporter } from 'nodemailer';

@Injectable()
export class AuthService {
  private transporter: Transporter;

  constructor(
    private readonly jwtService: JwtService,
    private readonly edgeService: EdgeJsService,
    private readonly configService: ConfigService,
  ) {
    this.transporter = createTransport({
      host: this.configService.get('SMTP_HOST'),
      port: this.configService.get('SMTP_PORT'),
      secure: false,
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    });
  }

  async sendMagicLink(email: string): Promise<boolean> {
    const adminEmail = this.configService.get('ADMIN_USERNAME');

    if (email !== adminEmail) {
      return false;
    }

    const token = this.jwtService.sign({ email }, { expiresIn: '5m' });

    const magicLink = `${this.configService.get('APP_URL')}/session/verify?token=${token}`;

    const edge = this.edgeService.getEdgeInstance();
    const template = edge.renderSync('components/mail/admin_login', { magicLink });

    try {
      await this.transporter.sendMail({
        from: this.configService.get('SMTP_USER'),
        to: email,
        subject: 'Dev goraebap blog Admin Login - Magic Link',
        html: template,
      });

      return true;
    } catch (error) {
      console.error('Email send error:', error);
      return false;
    }
  }

  async verifyToken(token: string): Promise<{ email: string } | null> {
    try {
      const result = this.jwtService.verify(token) as { email: string } | null;
      return Promise.resolve(result);
    } catch (error: unknown) {
      console.log(error);
      return Promise.resolve(null);
    }
  }
}
