import { Controller, Get, Param, Req } from '@nestjs/common';
import { NestMvcReq } from 'nestjs-mvc-tools';

import { PostSharedService } from 'src/core/application/_concern';
import { CommentQueryService } from 'src/core/application/comment';
import { PostPatchNotesService } from 'src/core/application/post';

@Controller({ path: 'patch-notes' })
export class PatchNotesController {
  constructor(
    private readonly postSharedService: PostSharedService,
    private readonly postPatchNotesService: PostPatchNotesService,
    private readonly commentQueryService: CommentQueryService,
  ) {}

  @Get()
  async index(@Req() req: NestMvcReq) {
    const posts = await this.postPatchNotesService.getPatchNotes();
    return req.view.render('pages/patch-notes/index', {
      posts,
    });
  }

  @Get(':slug')
  async show(@Req() req: NestMvcReq, @Param('slug') slug: string) {
    await this.postSharedService.updateViewCount(slug);

    const post = await this.postPatchNotesService.getPatchNote(slug);
    const comments = await this.commentQueryService.getPostComments(slug);
    const otherPosts = await this.postPatchNotesService.getOtherPatchNotes(slug);
    return req.view.render('pages/patch-notes/show', { 
      post, 
      comments, 
      otherPosts
    });
  }
}