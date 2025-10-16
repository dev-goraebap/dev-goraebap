import { Module } from "@nestjs/common";
import { AdminController } from "./admin.controller";
import { AdminBlockedIpModule } from "./blocked-ips";
import { AdminCommentModule } from "./comments";
import { CurationModule } from "./curation/curation.module";
import { AdminMediaModule } from "./media";
import { AdminPostModule } from "./posts";
import { AdminSeriesModule } from "./series";
import { AdminTagModule } from "./tags";

@Module({
  imports: [
    AdminPostModule,
    AdminSeriesModule,
    AdminMediaModule,
    AdminBlockedIpModule,
    AdminCommentModule,
    AdminTagModule,
    CurationModule,
  ],
  controllers: [AdminController]
})
export class AdminModule { }