import { Controller, Get, Param, Req } from '@nestjs/common';
import { NestMvcReq } from 'nestjs-mvc-tools';
import { PostsService } from './posts.service';

@Controller({ path: 'posts' })
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  async index(@Req() req: NestMvcReq) {
    // 실제 데이터 가져오기
    const posts = await this.postsService.getPosts();
    const tags = await this.postsService.getTags();
    const techNews = await this.postsService.getTechNews();

    return req.view.render('pages/feed/index', {
      posts,
      tags,
      techNews,
    });
  }

  @Get(':id')
  async show(@Param('id') id: number, @Req() req: NestMvcReq) {
    const post = await this.postsService.getPost(id);
    const relatedPosts = await this.postsService.getPosts();
    return req.view.render('pages/posts/show', { post, relatedPosts });
  }
}
