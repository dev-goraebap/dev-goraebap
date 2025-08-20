import { Controller, Get, Req } from '@nestjs/common';
import { NestMvcReq } from 'nestjs-mvc-tools';

import { FeedService } from './feed.service';

@Controller()
export class AppController {
  constructor(private readonly feedService: FeedService) {}

  /**
   * 피드 페이지
   */
  @Get()
  async index(@Req() req: NestMvcReq) {
    const posts = await this.feedService.getPosts();
    const patchNote = await this.feedService.getLatestPatchNote();
    const newsPosts = await this.feedService.getNewsPosts();

    return req.view.render('pages/feed/index', {
      posts,
      patchNote,
      newsPosts,
    });
  }
}
