import { Module, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";

import { AuthApplicationService } from "./use-cases/auth-application.service";
import { UserApplicationService } from "./use-cases/user-application.service";

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
  providers: [UserApplicationService, AuthApplicationService],
  exports: [AuthApplicationService]
})
export class UserModule implements OnModuleInit {

  constructor(
    private readonly userApplicationService: UserApplicationService
  ) { }

  async onModuleInit() {
    await this.userApplicationService.initAdmin();
  }
}