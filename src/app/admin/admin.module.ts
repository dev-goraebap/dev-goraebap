import { Module } from "@nestjs/common";

import { AdminBlockedIpModule } from "./blocked-ip/blocked-ip.module";
import { AdminCommentModule } from "./comment/comment.module";
import { AdminPostModule } from "./post/post.module";
import { AdminSeriesModule } from "./series/series.module";
import { AdminTagModule } from "./tag/tag.module";

const adminModules = [
  AdminPostModule,
  AdminCommentModule,
  AdminSeriesModule,
  AdminBlockedIpModule,
  AdminTagModule
]

@Module({
  imports: [
    ...adminModules
  ],
  exports: [
    ...adminModules
  ],
})
export class AdminModule {}