import { Controller, Get, Query, Req, Res, UsePipes } from '@nestjs/common';
import { NestMvcReq } from 'nestjs-mvc-tools';

import { FeedService } from './feed.service';
import { IsTurboStream, ZodValidationPipe } from 'src/common';
import { GetPostsDto, GetPostsSchema } from './dto/get-posts.dto';
import { Response } from 'express';

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
    console.log(dto);

    if (isTurboStream) {
      const postsData = await this.feedService.getPosts(dto);

      res.setHeader('Content-Type', 'text/vnd.turbo-stream.html');

      let template;
      if (!dto.cursor) {
        console.log('커서 없음');
        template = await req.view.render('pages/feed/posts/_list_replace', {
          postsData,
        });
      } else {
        console.log('커서 있음');
        template = await req.view.render('pages/feed/posts/_list_append', {
          postsData,
        });
      }

      return res.send(template);
    }

    const postsData = await this.feedService.getPosts(dto);
    const patchNote = await this.feedService.getLatestPatchNote();
    const newsPosts = await this.feedService.getNewsPosts();

    const template = await req.view.render('pages/feed/index', {
      postsData,
      patchNote,
      newsPosts,
    });
    return res.send(template);
  }
}
