import { Injectable } from "@nestjs/common";
import { BadRequestException } from "@nestjs/common";

import { UserEntity } from "../user/user.entity";
import { EmailService } from "./services/email.service";
import { TokenService } from "./services/token.service";

export interface SessionData {
  isAuthenticated: boolean;
  userEmail?: string;
}

@Injectable()
export class SessionApplicationService {
  constructor(
    private readonly tokenService: TokenService,
    private readonly emailService: EmailService,
  ) { }

  async login(email: string): Promise<boolean> {
    const user = await UserEntity.findByEmail(email);
    if (!user) {
      throw new BadRequestException('사용자를 찾을 수 없습니다.');
    }

    const token = this.tokenService.createMagicLinkToken(email);
    return this.emailService.sendMagicLink(email, token);
  }

  verifyToken(token: string): { email: string } | null {
    return this.tokenService.verifyToken(token);
  }

  createSession(email: string): SessionData {
    return {
      isAuthenticated: true,
      userEmail: email,
    };
  }

  isAuthenticated(session: any): boolean {
    return !!session?.isAuthenticated;
  }

  getUserEmail(session: any): string | null {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return session?.userEmail || null;
  }

  destroySession(session: any): void {
    if (session) {
      session.isAuthenticated = false;
      delete session.userEmail;
    }
  }
}