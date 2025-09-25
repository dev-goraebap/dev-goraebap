import { Module } from "@nestjs/common";

import { FeedController } from "./web/feed.controller";

@Module({ 
  imports: [],
  controllers: [FeedController],
  providers: []
})
export class FeedModule {}