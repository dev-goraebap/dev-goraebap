import { Controller, Get, Param, Req } from "@nestjs/common";
import { NestMvcReq } from "nestjs-mvc-tools";
import { CommentQueryService, PostQueryService } from "src/infra/queries";

@Controller({ path: 'posts' })
export class PostController {

  constructor(
    private readonly postQueryService: PostQueryService,
    private readonly commentQueryService: CommentQueryService
  ) { }

  @Get(':slug')
  async show(
    @Param('slug') slug: string,
    @Req() req: NestMvcReq
  ) {
    const [post, comments] = await Promise.all([
      this.postQueryService.getPostDetailBySlug(slug),
      this.commentQueryService.getPostComments(slug)
    ]);
    return req.view.render('pages/posts/show', { post, comments });
  }
}