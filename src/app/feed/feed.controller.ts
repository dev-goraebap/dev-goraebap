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
    @IsTurboStream() isTurboStream: boolean,
    @Res() res: Response,
  ) {
    const tags = await this.feedService.getTags();

    // 터보 스트림 요청의 경우 일부 화면요소만 업데이트
    if (isTurboStream) {
      const postsData = await this.feedService.getPosts(dto);
      res.setHeader('Content-Type', 'text/vnd.turbo-stream.html');
      let template: string;
      if (!dto.cursor) {
        template = await req.view.render('pages/feed/posts/_list_replace', {
          newUrl: req.originalUrl,
          postsData,
          tags,
        });
      } else {
        template = await req.view.render('pages/feed/posts/_list_append', {
          postsData,
          tags,
        });
      }

      return res.send(template);
    }

    const postsData = await this.feedService.getPosts(dto);
    const patchNote = await this.feedService.getLatestPatchNote();

    const template = await req.view.render('pages/feed/index', {
      postsData,
      patchNote,
      tags,
    });
    return res.send(template);
  }
}
