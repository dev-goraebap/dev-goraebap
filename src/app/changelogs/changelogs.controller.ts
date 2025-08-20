import { Controller, Get, Param, Req } from '@nestjs/common';
import { NestMvcReq } from 'nestjs-mvc-tools';

import { ChangelogsService } from './changelogs.service';

@Controller({ path: 'changelogs' })
export class ChangelogsController {
  constructor(private readonly changelogsService: ChangelogsService) {}

  @Get()
  index(@Req() req: NestMvcReq) {
    return req.view.render('pages/changelogs/index');
  }

  @Get(':slug')
  async show(@Req() req: NestMvcReq, @Param('slug') slug: string) {
    const post = await this.changelogsService.getChangelog(slug);
    const latestPosts = await this.changelogsService.getChangelogsExcludeBy(slug);
    return req.view.render('pages/changelogs/show', { post, latestPosts });
  }
}
