import { Controller, Get, Req } from '@nestjs/common';
import { NestMvcReq } from 'nestjs-mvc-tools';
import { PostsService } from './posts.service';

@Controller({ path: 'posts' })
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  async index(@Req() req: NestMvcReq) {
    // 실제 데이터 가져오기
    const posts = await this.postsService.getPosts();
    const popularPosts = await this.postsService.getPopularPosts();
    const tags = await this.postsService.getTags();
    const activities = await this.postsService.getRecentActivities();

    return req.view.render('pages/posts/index', {
      posts,
      popularPosts,
      tags,
      activities
    });
  }
}
