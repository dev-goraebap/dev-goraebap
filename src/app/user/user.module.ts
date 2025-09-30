import { Module, OnModuleInit } from "@nestjs/common";

import { UserApplicationService } from "./user-application.service";
import { UserDataGateway } from "./user.data-gateway";
import { UserTableModule } from "./user.table-module";

@Module({
  imports: [],
  providers: [UserApplicationService, UserTableModule, UserDataGateway],
  exports: [UserTableModule]
})
export class UserModule implements OnModuleInit {

  constructor(
    private readonly userApplicationService: UserApplicationService
  ) { }

  async onModuleInit() {
    await this.userApplicationService.initAdmin();
  }
}