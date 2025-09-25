import { Module } from "@nestjs/common";

import { UserAuthService } from "./services/user-auth.service";
import { UserSessionService } from "./services/user-session.service";
import { SessionController } from "./web/session.controller";

@Module({
  imports: [],
  controllers: [SessionController],
  providers: [UserAuthService, UserSessionService]
})
export class SessionModule {}