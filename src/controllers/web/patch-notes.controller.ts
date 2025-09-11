import { Controller, Get, Param, Req, UsePipes } from '@nestjs/common';
import { NestMvcReq } from 'nestjs-mvc-tools';

import { ZodValidationPipe } from 'src/common';
import { CommentsSharedService, PostsSharedService } from 'src/shared';
import { PostPatchNotesService } from 'src/modules/post/application/services/post-patch-notes.service';

@Controller({ path: 'patch-notes' })
export class PatchNotesController {
  constructor(
    private readonly postsSharedService: PostsSharedService,
    private readonly postPatchNotesService: PostPatchNotesService,
    private readonly commentsSharedService: CommentsSharedService,
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
    await this.postsSharedService.updateViewCount(slug);

    const post = await this.postPatchNotesService.getPatchNote(slug);
    const comments = await this.commentsSharedService.getComments(slug);
    const otherPosts = await this.postPatchNotesService.getOtherPatchNotes(slug);
    return req.view.render('pages/patch-notes/show', { 
      post, 
      comments, 
      otherPosts
    });
  }
}