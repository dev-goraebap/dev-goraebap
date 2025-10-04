import { Controller, Get, Param, Query, Req, Res, UsePipes } from '@nestjs/common';
import { Response } from 'express';
import { NestMvcReq } from 'nestjs-mvc-tools';

import { IsTurboStream, ZodValidationPipe } from 'src/common';
import { GetFeedPostsDto, GetFeedPostsSchema } from 'src/infra/dto';
import { CommentQueryService, PostQueryService } from 'src/infra/queries';

@Controller({ path: 'patch-notes' })
export class PatchNoteController {
  constructor(
    private readonly postQueryService: PostQueryService,
    private readonly commentQueryService: CommentQueryService
  ) { }

  @Get()
  @UsePipes(new ZodValidationPipe(GetFeedPostsSchema))
  async index(
    @Req() req: NestMvcReq,
    @Query() dto: GetFeedPostsDto,
    @Res() res: Response,
    @IsTurboStream() isTurboStream: boolean,
  ) {
    // 더보기 버튼 클릭 시 Turbo Stream 응답
    if (isTurboStream && dto.cursor) {
      const postsData = await this.postQueryService.getPostsWithCursor({
        ...dto,
        postType: 'patch-note',
        orderType: 'latest'
      });

      res.setHeader('Content-Type', 'text/vnd.turbo-stream.html');
      const template = await req.view.render('pages/patch-notes/posts/_list_append', {
        postsData
      });
      return res.send(template);
    }

    const postsData = await this.postQueryService.getPostsWithCursor({
      ...dto,
      postType: 'patch-note',
      orderType: 'latest'
    });
    const template = await req.view.render('pages/patch-notes/index', {
      postsData
    });
    return res.send(template);
  }

  @Get(':slug')
  async show(@Req() req: NestMvcReq, @Param('slug') slug: string) {
    const [post, comments, otherPosts] = await Promise.all([
      this.postQueryService.getPostDetailBySlug(slug),
      this.commentQueryService.getPostComments(slug),
      this.postQueryService.getOtherPatchNotes(slug)
    ]);

    return req.view.render('pages/patch-notes/show', { post, comments, otherPosts });
  }
}