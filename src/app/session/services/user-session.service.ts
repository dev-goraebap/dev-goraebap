import { Injectable } from '@nestjs/common';

export interface SessionData {
  isAuthenticated: boolean;
  userEmail?: string;
}

@Injectable()
export class UserSessionService {
  createSession(email: string): SessionData {
    return {
      isAuthenticated: true,
      userEmail: email,
    };
  }

  isAuthenticated(session: any): boolean {
    return !!session?.isAuthenticated;
  }

  getUserEmail(session: any) {
    return session?.userEmail || null;
  }

  destroySession(session: any): void {
    if (session) {
      session.isAuthenticated = false;
      delete session.userEmail;
    }
  }
}