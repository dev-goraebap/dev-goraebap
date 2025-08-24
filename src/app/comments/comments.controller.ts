import { Body, Controller, Get, Param, Post, Req, Res, UsePipes } from '@nestjs/common';

import { RequestId, ZodValidationPipe } from 'src/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto, CreateCommentSchema } from './dto/create-comment.dto';
import { Response } from 'express';
import { NestMvcReq } from 'nestjs-mvc-tools';

@Controller({ path: ':postId/comments' })
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  async index(@Req() req: NestMvcReq, @Res() res: Response, @Param('postId') postId: number) {
    const comments = await this.commentsService.getComments(postId);
    const template = await req.view.render('components/partials/comments/_create_success', {
      postId,
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
    @Param('postId') postId: number,
    @Body('comment') dto: CreateCommentDto,
  ) {
    req.flash.success('댓글 달아주셔서 감사합니다 🤩');
    await this.commentsService.create(requestId, postId, dto);
    res.redirect(`/${postId}/comments`);
  }
}
