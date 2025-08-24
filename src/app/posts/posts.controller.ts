import { Controller, Get, Param, Req } from '@nestjs/common';
import { NestMvcReq } from 'nestjs-mvc-tools';

import { CommentsSharedService, PostsSharedService } from 'src/shared';
import { PostsService } from './posts.service';

@Controller({ path: 'posts' })
export class PostsController {
  constructor(
    private readonly postsSharedService: PostsSharedService,
    private readonly commentsSharedService: CommentsSharedService,
    private readonly postsService: PostsService,
  ) {}

  @Get(':slug')
  async show(@Param('slug') slug: string, @Req() req: NestMvcReq) {
    await this.postsSharedService.updateViewCount(slug);

    const post = await this.postsService.getPost(slug);
    const comments = await this.commentsSharedService.getComments(slug);
    const suggestedPosts = await this.postsService.getRandomSuggestedPosts(slug);
    return req.view.render('pages/posts/show', { post, comments, suggestedPosts });
  }
}
