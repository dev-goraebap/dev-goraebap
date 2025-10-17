import { Global, Module, OnModuleInit } from "@nestjs/common";

import { AdminInitializerService, MediaCleanupService, PostViewService } from "./services";

@Global()
@Module({
  providers: [
    MediaCleanupService,
    AdminInitializerService,
    PostViewService
  ],
  exports: [
    PostViewService
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