import { Global, Module } from "@nestjs/common";
import { MybatisService } from "./mybatis.service";

@Global()
@Module({
  imports: [],
  providers: [MybatisService],
  exports: [MybatisService],
})
export class MybatisModule {}