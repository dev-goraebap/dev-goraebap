import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";

import { EmailService } from "./services/email.service";
import { TokenService } from "./services/token.service";
import { SessionApplicationService } from "./session-application.service";
import { SessionController } from "./web/session.controller";

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '1h'),
        },
      }),
      inject: [ConfigService],
    })
  ],
  controllers: [SessionController],
  providers: [EmailService, TokenService, SessionApplicationService],
  exports: []
})
export class SessionModule { }