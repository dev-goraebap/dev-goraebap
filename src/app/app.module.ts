import { Global, Module, OnModuleInit } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";

import { AdminInitializerService } from "./services/admin-initializer.service";
import { MediaCleanupService } from "./services/media-cleanup.service";

@Global()
@Module({
  imports: [
    ScheduleModule.forRoot(),
  ],
  providers: [
    AdminInitializerService,
    MediaCleanupService
  ],
})
export class AppModule implements OnModuleInit {

  constructor(
    private readonly adminInitializerService: AdminInitializerService
  ) { }

  async onModuleInit() {
    await this.adminInitializerService.create();
  }
}