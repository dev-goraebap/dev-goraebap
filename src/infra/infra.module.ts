import { Global, Module } from "@nestjs/common";
import { BlockedIpQueryService, TagQueryService } from "./queries";

const queries = [
  BlockedIpQueryService,
  TagQueryService
];

@Global()
@Module({
  imports: [],
  providers: [...queries],
  exports: [...queries],
})
export class InfraModule { }