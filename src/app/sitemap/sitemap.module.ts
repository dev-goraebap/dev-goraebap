import { Module } from "@nestjs/common";

import { SitemapQueryService } from "./services/sitemap-query.service";
import { SitemapController } from "./web/sitemap.controller";

@Module({
  imports: [],
  controllers: [SitemapController],
  providers: [SitemapQueryService]
})
export class SitemapModule {}