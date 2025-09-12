import { Module } from "@nestjs/common";

import { BlockedIpModule } from "./blocked-ip";
import { CommentModule } from "./comment";
import { MediaModule } from "./media";
import { PostModule } from "./post";
import { SeriesModule } from "./series";
import { TagModule } from "./tag";
import { UserModule } from "./user";

const domainModules = [
  PostModule,
  SeriesModule,
  CommentModule,
  TagModule,
  BlockedIpModule,
  MediaModule,
  UserModule,
];

@Module({
  imports: [
    ...domainModules
  ],
  exports: [
    ...domainModules
  ]
})
export class ApplicationModule { }