import { Controller, Get, Param, Req } from '@nestjs/common';
import { NestMvcReq } from 'nestjs-mvc-tools';

import { PostSharedService } from 'src/core/application/_concern';
import { CommentSharedService } from 'src/core/application/comment';
import { PostQueryService } from 'src/core/application/post';

@Controller({ path: 'posts' })
export class PostController {
  constructor(
    private readonly postSharedService: PostSharedService,
    private readonly commentSharedService: CommentSharedService,
    private readonly postQueryService: PostQueryService,
  ) {}

  @Get(':slug')
  async show(@Param('slug') slug: string, @Req() req: NestMvcReq) {
    await this.postSharedService.updateViewCount(slug);

    const post = await this.postQueryService.getPublishedPostBySlug(slug);
    const comments = await this.commentSharedService.getComments(slug);
    const suggestedPosts = await this.postQueryService.getRandomSuggestedPosts(slug);
    return req.view.render('pages/posts/show', { post, comments, suggestedPosts });
  }
}