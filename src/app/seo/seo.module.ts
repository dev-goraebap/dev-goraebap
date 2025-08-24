import { Module } from '@nestjs/common';
import { PostsSharedService } from 'src/shared';
import { SitemapController } from './sitemap.controller';

@Module({
  controllers: [SitemapController],
  providers: [PostsSharedService],
})
export class SeoModule {}