import { Module } from "@nestjs/common";
import { FeedController } from "./feed.controller";

@Module({
  imports: [],
  controllers: [FeedController]
})
export class FeedModule { }