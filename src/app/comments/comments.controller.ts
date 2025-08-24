import { Body, Controller, Get, Param, Post, Req, Res, UsePipes } from '@nestjs/common';

import { Response } from 'express';
import { NestMvcReq } from 'nestjs-mvc-tools';
import { RequestId, ZodValidationPipe } from 'src/common';
import { CommentsSharedService } from 'src/shared';
import { CommentsService } from './comments.service';
import { CreateCommentDto, CreateCommentSchema } from './dto/create-comment.dto';

@Controller({ path: ':postSlug/comments' })
export class CommentsController {
  constructor(
    private readonly commentsSharedService: CommentsSharedService,
    private readonly commentsService: CommentsService,
  ) {}

  @Get()
  async index(@Req() req: NestMvcReq, @Res() res: Response, @Param('postSlug') postSlug: string) {
    const comments = await this.commentsSharedService.getComments(postSlug);
    const template = await req.view.render('components/partials/comments/_create_success', {
      postSlug,
      comments,
    });
    res.setHeader('Content-Type', 'text/vnd.turbo-stream.html');
    return res.send(template);
  }

  @Post()
  @UsePipes(new ZodValidationPipe(CreateCommentSchema))
  async create(
    @Req() req: NestMvcReq,
    @Res() res: Response,
    @RequestId() requestId: string,
    @Param('postSlug') postSlug: string,
    @Body('comment') dto: CreateCommentDto,
  ) {
    req.flash.success('댓글 달아주셔서 감사합니다 🤩');
    await this.commentsService.create(requestId, postSlug, dto);
    res.redirect(`/${postSlug}/comments`);
  }
}
