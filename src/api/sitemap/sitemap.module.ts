import { Module } from "@nestjs/common";

import { SitemapController } from "./sitemap.controller";

@Module({
  imports: [],
  controllers: [SitemapController],
  providers: []
})
export class SitemapModule {}