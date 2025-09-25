import { Controller, Get, Param, Req } from '@nestjs/common';
import { NestMvcReq } from 'nestjs-mvc-tools';

import { CommentQueryService as FeatureCommentQueryService } from 'src/features/comment';
import { PostQueryService as FeaturePostQueryService, ViewCountUpdateService } from 'src/features/post';
import { PatchNoteQueryService } from '../services/patch-note-query.service';

@Controller({ path: 'patch-notes' })
export class PatchNoteController {
  constructor(
    private readonly featurePostQueryService: FeaturePostQueryService,
    private readonly featureCommentQueryService: FeatureCommentQueryService,
    private readonly patchNoteQueryService: PatchNoteQueryService,
    private readonly viewCountUpdateService: ViewCountUpdateService,
  ) { }

  @Get()
  async index(@Req() req: NestMvcReq) {
    const posts = await this.patchNoteQueryService.getPatchNotes();
    return req.view.render('pages/patch-notes/index', {
      posts,
    });
  }

  @Get(':slug')
  async show(@Req() req: NestMvcReq, @Param('slug') slug: string) {
    await this.viewCountUpdateService.update(slug);

    const post = await this.featurePostQueryService.getPostDetail(slug);
    const comments = await this.featureCommentQueryService.getPostComments(slug);
    const otherPosts = await this.patchNoteQueryService.getOtherPatchNotes(slug);
    return req.view.render('pages/patch-notes/show', {
      post,
      comments,
      otherPosts
    });
  }
}