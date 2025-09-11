import { Controller, Get, Param, Req } from '@nestjs/common';
import { NestMvcReq } from 'nestjs-mvc-tools';

import { CommentsSharedService, PostsSharedService } from 'src/shared';
import { PostQueryService } from 'src/modules/post/application/orchestrators/post-query.service';

@Controller({ path: 'posts' })
export class PostController {
  constructor(
    private readonly postsSharedService: PostsSharedService,
    private readonly commentsSharedService: CommentsSharedService,
    private readonly postQueryService: PostQueryService,
  ) {}

  @Get(':slug')
  async show(@Param('slug') slug: string, @Req() req: NestMvcReq) {
    await this.postsSharedService.updateViewCount(slug);

    const post = await this.postQueryService.getPublishedPostBySlug(slug);
    const comments = await this.commentsSharedService.getComments(slug);
    const suggestedPosts = await this.postQueryService.getRandomSuggestedPosts(slug);
    return req.view.render('pages/posts/show', { post, comments, suggestedPosts });
  }
}