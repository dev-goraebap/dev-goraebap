import { Controller, Delete, Get, Param, Query, Req, Res, UseGuards, UsePipes } from '@nestjs/common';
import { Response } from 'express';
import { NestMvcReq } from 'nestjs-mvc-tools';

import { AdminAuthGuard, ZodValidationPipe } from 'src/common';
import { GetAdminCommentsDto, GetAdminCommentsSchema } from 'src/infra/dto';
import { CommentQueryService } from 'src/infra/queries';
import { CommentApplicationService } from './comment-application.service';

@Controller({ path: 'admin/comments' })
@UseGuards(AdminAuthGuard)
export class AdminCommentController {
  constructor(
    private readonly commentQueryService: CommentQueryService,
    private readonly commentCommandService: CommentApplicationService
  ) { }

  @Get()
  @UsePipes(new ZodValidationPipe(GetAdminCommentsSchema))
  async index(@Req() req: NestMvcReq, @Query() dto: GetAdminCommentsDto) {
    const commentData = await this.commentQueryService.getAdminComments(dto);
    return req.view.render('pages/admin/comments/index', { ...commentData });
  }

  // 정책을 위반한 댓글 차단
  @Delete(':id')
  async banComment(@Req() req: NestMvcReq, @Param('id') id: number, @Res() res: Response) {
    await this.commentCommandService.banComment(id);
    req.flash.success('정책 위반 댓글을 차단하였습니다.');
    return res.redirect(303, '/admin/comments');
  }
}
