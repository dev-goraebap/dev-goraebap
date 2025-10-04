import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { EdgeJsService } from "nestjs-mvc-tools";
import { createTransport, Transporter } from "nodemailer";

@Injectable()
export class EmailService {
  private transporter: Transporter;

  constructor(
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

  async sendMagicLink(email: string, token: string): Promise<boolean> {
    const magicLink = `${this.configService.get('APP_URL')}/session/verify?token=${token}`;

    const edge = this.edgeService.getEdgeInstance();
    const template = edge.renderSync('components/mail/admin_login', {
      magicLink,
    });

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
}