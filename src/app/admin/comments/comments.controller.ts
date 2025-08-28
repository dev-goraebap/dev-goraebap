import { Body, Controller, Delete, Get, Param, Query, Req, Res, UseGuards, UsePipes } from '@nestjs/common';
import { NestMvcReq } from 'nestjs-mvc-tools';
import { AdminAuthGuard, ZodValidationPipe } from 'src/common';
import { CommentsService } from './comments.service';
import { Response } from 'express';
import { GetCommentsDto, GetCommentsSchema } from './dto/get-comments.dto';

@Controller({ path: 'admin/comments' })
@UseGuards(AdminAuthGuard)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  @UsePipes(new ZodValidationPipe(GetCommentsSchema))
  async index(@Req() req: NestMvcReq, @Query() dto: GetCommentsDto) {
    const commentData = await this.commentsService.getComments(dto);
    return req.view.render('pages/admin/comments/index', { ...commentData });
  }

  // 정책을 위반한 댓글 차단
  @Delete(':id')
  async banComment(@Req() req: NestMvcReq, @Param('id') id: number, @Res() res: Response) {
    await this.commentsService.banComment(id);
    req.flash.success('정책 위반 댓글을 차단하였습니다.');
    return res.redirect(303, '/admin/comments');
  }
}
