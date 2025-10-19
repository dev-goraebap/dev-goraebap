import { Module } from "@nestjs/common";

import { SeriesPostController } from "./post.controller";

@Module({
  controllers: [SeriesPostController],
  providers: [],
})
export class SeriesPostModule { }