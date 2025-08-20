import { Controller, Get, Param, Req } from '@nestjs/common';
import { NestMvcReq } from 'nestjs-mvc-tools';
import { PostsService } from './posts.service';

@Controller({ path: 'posts' })
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get(':slug')
  async show(@Param('slug') slug: string, @Req() req: NestMvcReq) {
    const post = await this.postsService.getPost(slug);
    const relatedPosts = await this.postsService.getPostsExcludeBy(slug);
    return req.view.render('pages/posts/show', { post, relatedPosts });
  }
}
