import { Module, OnModuleInit } from "@nestjs/common";

import { UserApplicationService } from "./user-application.service";

@Module({
  imports: [],
  providers: [UserApplicationService],
  exports: []
})
export class UserModule implements OnModuleInit {

  constructor(
    private readonly userApplicationService: UserApplicationService
  ) { }

  async onModuleInit() {
    await this.userApplicationService.initAdmin();
  }
}