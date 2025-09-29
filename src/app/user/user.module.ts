import { Module, OnModuleInit } from "@nestjs/common";
import { UserApplicationService } from "./user-application.service";
import { UserRepository } from "./user.repository";
import { UserService } from "./user.service";

@Module({
  imports: [],
  providers: [UserApplicationService, UserService, UserRepository],
  exports: [UserService]
})
export class UserModule implements OnModuleInit {

  constructor(
    private readonly userApplicationService: UserApplicationService
  ) { }

  async onModuleInit() {
    await this.userApplicationService.initAdmin();
  }
}