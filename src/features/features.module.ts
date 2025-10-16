import { Global, Module, OnModuleInit } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";

import { AdminInitializerService, MediaCleanupService, PostViewService } from "./services";

@Global()
@Module({
  imports: [
    ScheduleModule.forRoot(),
  ],
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