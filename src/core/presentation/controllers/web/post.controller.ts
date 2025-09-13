import { Controller, Get, Param, Req } from '@nestjs/common';
import { NestMvcReq } from 'nestjs-mvc-tools';

import { PostSharedService } from 'src/core/application/_concern';
import { CommentQueryService } from 'src/core/application/comment';
import { PostQueryService } from 'src/core/application/post';

@Controller({ path: 'posts' })
export class PostController {
  constructor(
    private readonly postSharedService: PostSharedService,
    private readonly postQueryService: PostQueryService,
    private readonly commentQueryService: CommentQueryService,
  ) {}

  @Get(':slug')
  async show(@Param('slug') slug: string, @Req() req: NestMvcReq) {
    await this.postSharedService.updateViewCount(slug);

    const post = await this.postQueryService.getPublishedPostBySlug(slug);
    const suggestedPosts = await this.postQueryService.getRandomSuggestedPosts(slug);
    const comments = await this.commentQueryService.getPostComments(slug);
    return req.view.render('pages/posts/show', { post, comments, suggestedPosts });
  }
}