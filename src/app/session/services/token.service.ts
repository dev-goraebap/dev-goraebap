import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) { }

  createMagicLinkToken(email: string): string {
    return this.jwtService.sign({ email }, { expiresIn: '5m' });
  }

  verifyToken(token: string): { email: string } | null {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      return this.jwtService.verify(token) as { email: string };
    } catch (error: unknown) {
      console.debug(error);
      return null;
    }
  }
}