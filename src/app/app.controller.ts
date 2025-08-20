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
    const changelog = await this.feedService.getLatestChangelog();
    const newsPosts = await this.feedService.getNewsPosts();
    const techNews = await this.feedService.getTechNews();

    return req.view.render('pages/feed/index', {
      posts,
      changelog,
      newsPosts,
      techNews,
    });
  }
}
