import { Controller, Get, Param, Req, UsePipes } from '@nestjs/common';
import { NestMvcReq } from 'nestjs-mvc-tools';

import { ZodValidationPipe } from 'src/common';
import { CommentsSharedService, PostsSharedService } from 'src/shared';
// TODO: PatchNotes 모듈 완성 후 연결
// import { GetPostsSchema } from 'src/modules/patch-notes/application/dto/get-posts.dto';
// import { PatchNotesService } from 'src/modules/patch-notes/application/services/patch-notes.service';

@Controller({ path: 'patch-notes' })
export class PatchNotesController {
  constructor(
    private readonly postsSharedService: PostsSharedService,
    // private readonly patchNotesService: PatchNotesService,
    private readonly commentsSharedService: CommentsSharedService,
  ) {}

  @Get()
  // @UsePipes(new ZodValidationPipe(GetPostsSchema))
  async index(@Req() req: NestMvcReq) {
    // TODO: 새로운 모듈 구조에 맞게 서비스 로직 재구성
    // const posts = await this.patchNotesService.getPatchNotes();
    return req.view.render('pages/patch-notes/index', {
      posts: [], // 임시
    });
  }

  @Get(':slug')
  async show(@Req() req: NestMvcReq, @Param('slug') slug: string) {
    await this.postsSharedService.updateViewCount(slug);

    // TODO: 새로운 모듈 구조에 맞게 서비스 로직 재구성
    // const post = await this.patchNotesService.getPatchNote(slug);
    const comments = await this.commentsSharedService.getComments(slug);
    // const otherPosts = await this.patchNotesService.getOtherPatchNotes(slug);
    return req.view.render('pages/patch-notes/show', { 
      post: null, // 임시 
      comments, 
      otherPosts: [] // 임시
    });
  }
}