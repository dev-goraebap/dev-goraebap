import { Global, Module } from "@nestjs/common";
import { BlockedIpQueryService } from "./queries";

const queries = [
  BlockedIpQueryService
];

@Global()
@Module({
  imports: [],
  providers: [...queries],
  exports: [...queries],
})
export class InfraModule { }