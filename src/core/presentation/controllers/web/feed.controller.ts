import { Controller, Get, Query, Req, Res, UsePipes } from '@nestjs/common';
import { Response } from 'express';
import { NestMvcReq } from 'nestjs-mvc-tools';

import { PostQueryService } from 'src/core/application/post';
import { TagQueryService } from 'src/core/application/tag';
import { GetFeedPostsDto, GetFeedPostsSchema } from 'src/core/infrastructure/dto';
import { IsTurboStream } from '../../decorators';
import { ZodValidationPipe } from '../../pipes';

@Controller({ path: '' })
export class FeedController {
  constructor(
    private readonly postQueryService: PostQueryService,
    private readonly tagQueryService: TagQueryService
  ) { }

  @Get()
  @UsePipes(new ZodValidationPipe(GetFeedPostsSchema))
  async index(
    @Req() req: NestMvcReq,
    @Query() dto: GetFeedPostsDto,
    @Res() res: Response,
    @IsTurboStream() isTurboStream: boolean,
  ) {
    // 커서가 있는 경우(더보기)의 경우 터보 스트림 응답
    // 페이지 교체가 아니라 데이터를 아래 쌓아야하기 때문
    if (isTurboStream && dto.cursor) {
      const postsData = await this.postQueryService.getFeedPosts(dto);

      res.setHeader('Content-Type', 'text/vnd.turbo-stream.html');
      const template = await req.view.render('pages/feed/posts/_list_append', {
        postsData
      });
      return res.send(template);
    }


    const [postsData, patchNote, tags] = await Promise.all([
      this.postQueryService.getFeedPosts(dto),
      this.postQueryService.getLatestPatchNotePost(),
      this.tagQueryService.getFeedTags()
    ]);
    const template = await req.view.render('pages/feed/index', {
      postsData,
      patchNote,
      tags
    });
    return res.send(template);
  }
}