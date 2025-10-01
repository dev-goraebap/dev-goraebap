import { Global, Module } from "@nestjs/common";
import { BlockedIpQueryService, CommentQueryService, TagQueryService } from "./queries";

const queries = [
  BlockedIpQueryService,
  TagQueryService,
  CommentQueryService
];

@Global()
@Module({
  imports: [],
  providers: [...queries],
  exports: [...queries],
})
export class InfraModule { }