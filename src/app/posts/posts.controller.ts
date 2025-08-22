import { Controller, Get, Param, Req } from '@nestjs/common';
import { NestMvcReq } from 'nestjs-mvc-tools';
import { PostsSharedService } from 'src/shared';
import { PostsService } from './posts.service';

@Controller({ path: 'posts' })
export class PostsController {
  constructor(
    private readonly postsSharedService: PostsSharedService,
    private readonly postsService: PostsService,
  ) {}

  @Get(':slug')
  async show(@Param('slug') slug: string, @Req() req: NestMvcReq) {
    await this.postsSharedService.updateViewCount(slug);

    const post = await this.postsService.getPost(slug);
    const suggestedPosts = await this.postsService.getRandomSuggestedPosts(slug);
    return req.view.render('pages/posts/show', { post, suggestedPosts });
  }
}
