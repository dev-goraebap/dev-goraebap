import { Module } from "@nestjs/common";

import { PostTagDataGateway } from "./post-tag.data-gateway";
import { PostTagTableModule } from "./post-tag.table-module";

@Module({
  imports: [],
  providers: [PostTagTableModule, PostTagDataGateway],
  exports: [PostTagTableModule]
})
export class PostTagModule {}