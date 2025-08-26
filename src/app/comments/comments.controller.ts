import { Body, Controller, Get, Param, Post, Req, Res, UsePipes } from '@nestjs/common';
import { Response } from 'express';
import { NestMvcReq } from 'nestjs-mvc-tools';

import { RequestId, ZodValidationPipe } from 'src/common';
import { CommentsApplicationService } from './comments-application.service';
import { CreateCommentDto, CreateCommentSchema } from './dto/create-comment.dto';

@Controller({ path: ':postSlug/comments' })
export class CommentsController {
  constructor(
    private readonly commentsAppService: CommentsApplicationService
  ) {}

  @Get()
  async index(@Req() req: NestMvcReq, @Res() res: Response, @Param('postSlug') postSlug: string) {
    const comments = await this.commentsAppService.getComments(postSlug);
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
    await this.commentsAppService.create(requestId, postSlug, dto);
    res.redirect(`/${postSlug}/comments`);
  }
}
