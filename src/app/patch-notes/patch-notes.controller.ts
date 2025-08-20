import { Controller, Get, Param, Req } from '@nestjs/common';
import { NestMvcReq } from 'nestjs-mvc-tools';

import { PostsSharedService } from 'src/shared';
import { PatchNotesService } from './patch-notes.service';

@Controller({ path: 'patch-notes' })
export class PatchNotesController {
  constructor(
    private readonly postsSharedService: PostsSharedService,
    private readonly patchNotesService: PatchNotesService,
  ) {}

  @Get()
  async index(@Req() req: NestMvcReq) {
    const posts = await this.patchNotesService.getPatchNotes();
    return req.view.render('pages/patch-notes/index', { posts });
  }

  @Get(':slug')
  async show(@Req() req: NestMvcReq, @Param('slug') slug: string) {
    await this.postsSharedService.updateViewCount(slug);

    const post = await this.patchNotesService.getPatchNote(slug);
    const latestPosts = await this.patchNotesService.getPatchNotesExcludeBy(slug);
    return req.view.render('pages/patch-notes/show', { post, latestPosts });
  }
}
