import { Controller, Get, Param, Req } from "@nestjs/common";

import { NestMvcReq } from "nestjs-mvc-tools";
import { PostQueryService } from "src/infra/queries";

@Controller({ path: 'series/:seriesSlug' })
export class SeriesPostController {

  constructor(
    private readonly postQueryService: PostQueryService
  ) { }

  @Get(':postSlug')
  async show(
    @Req() req: NestMvcReq,
    @Param('seriesSlug') seriesSlug: string,
    @Param('postSlug') postSlug: string
  ) {
    const [post, prevPost, nextPost] = await Promise.all([
      this.postQueryService.getPostDetailBySlug(postSlug),
      this.postQueryService.getPrevPostInSeries(seriesSlug, postSlug),
      this.postQueryService.getNextPostInSeries(seriesSlug, postSlug)
    ]);

    return req.view.render('pages/series/posts/show', {
      post,
      seriesSlug,
      prevPost,
      nextPost
    });
  }
}