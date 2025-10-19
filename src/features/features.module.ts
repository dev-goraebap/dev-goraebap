import { Global, Module, OnModuleInit } from "@nestjs/common";

import { AdminInitializerService, MediaCleanupService, PostViewCommandService } from "./services";

@Global()
@Module({
  providers: [
    MediaCleanupService,
    AdminInitializerService,
    PostViewCommandService
  ],
  exports: [
    PostViewCommandService
  ]
})
export class FeaturesModule implements OnModuleInit {

  constructor(
    private readonly adminInitializerService: AdminInitializerService
  ) { }

  async onModuleInit() {
    await this.adminInitializerService.create();
  }
}