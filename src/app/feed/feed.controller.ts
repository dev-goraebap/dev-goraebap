import { Controller, Get, Query, Req, Res, UsePipes } from '@nestjs/common';
import { Response } from 'express';
import { NestMvcReq } from 'nestjs-mvc-tools';

import { IsTurboStream, ZodValidationPipe } from 'src/common';
import { GetPostsDto, GetPostsSchema } from './dto/get-posts.dto';
import { FeedService } from './feed.service';

@Controller({ path: '' })
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  /**
   * 피드 페이지
   */
  @Get()
  @UsePipes(new ZodValidationPipe(GetPostsSchema))
  async index(
    @Req() req: NestMvcReq,
    @Query() dto: GetPostsDto,
    @Res() res: Response,
    @IsTurboStream() isTurboStream: boolean,
  ) {
    const postsData = await this.feedService.getPosts(dto);
    const tags = await this.feedService.getTags();

    // 커서가 있는 경우(더보기)의 경우 터보 스트림 응답
    // 페이지 교체가 아니라 데이터를 아래 쌓아야하기 때문
    if (isTurboStream && dto.cursor) {
      res.setHeader('Content-Type', 'text/vnd.turbo-stream.html');
      const template = await req.view.render('pages/feed/posts/_list_append', {
        postsData,
        tags,
      });
      return res.send(template);
    }

    const patchNote = await this.feedService.getLatestPatchNote();
    const template = await req.view.render('pages/feed/index', {
      postsData,
      patchNote,
      tags,
    });
    return res.send(template);
  }
}
