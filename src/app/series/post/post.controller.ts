import { Controller, Get, Param, Req } from "@nestjs/common";
import { NestMvcReq } from "nestjs-mvc-tools";

import { PostViewService } from "src/features/services";
import { CommentQueryService, PostQueryService } from "src/infra/queries";

@Controller({ path: 'series/:seriesSlug' })
export class SeriesPostController {

  constructor(
    private readonly postQueryService: PostQueryService,
    private readonly commentQueryService: CommentQueryService,
    private readonly postViewService: PostViewService
  ) { }

  @Get(':postSlug')
  async show(
    @Req() req: NestMvcReq,
    @Param('seriesSlug') seriesSlug: string,
    @Param('postSlug') postSlug: string
  ) {
    const [post, prevPost, nextPost, comments] = await Promise.all([
      this.postQueryService.getPostDetailBySlug(postSlug),
      this.postQueryService.getPrevPostInSeries(seriesSlug, postSlug),
      this.postQueryService.getNextPostInSeries(seriesSlug, postSlug),
      this.commentQueryService.getPostComments(postSlug),
      this.postViewService.increment(postSlug)
    ]);

    return req.view.render('pages/series/posts/show', {
      post,
      seriesSlug,
      prevPost,
      nextPost,
      comments
    });
  }
}