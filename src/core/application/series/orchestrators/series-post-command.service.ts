import { BadRequestException, Inject } from "@nestjs/common";
import { and, eq, inArray, sql } from "drizzle-orm";

import { DRIZZLE, DrizzleOrm, posts, series, seriesPosts } from "src/shared/drizzle";

export class SeriesPostCommandService {

  constructor(
    @Inject(DRIZZLE)
    private readonly drizzle: DrizzleOrm
  ) { }

  async create(seriesId: number, postId: number) {
    const seriesItem = await this.drizzle.query.series.findFirst({
      where: eq(series.id, seriesId)
    });
    if (!seriesItem) {
      throw new BadRequestException('시리즈를 찾을 수 없습니다.');
    }

    const post = await this.drizzle.query.posts.findFirst({
      where: eq(posts.id, postId)
    });
    if (!post) {
      throw new BadRequestException('게시물을 찾을 수 없습니다.');
    }

    await this.drizzle
      .insert(seriesPosts)
      .values({
        seriesId: seriesItem.id,
        postId: post.id
      });
  }

  async updateOrders(idAndOrders: { id: number; order: number }[]) {
    if (idAndOrders.length === 0) return;

    const cases = idAndOrders
      .map(({ id, order }) => `WHEN ${id} THEN ${order}`)
      .join(' ');

    const ids = idAndOrders.map(({ id }) => id);

    await this.drizzle
      .update(seriesPosts)
      .set({
        order: sql`CASE id ${sql.raw(cases)} END`
      })
      .where(inArray(seriesPosts.id, ids));
  }

  async destroy(seriesId: number, postId: number) {
    const seriesPost = await this.drizzle.query.seriesPosts.findFirst({
      where: and(
        eq(seriesPosts.seriesId, seriesId),
        eq(seriesPosts.postId, postId)
      )
    });

    if (!seriesPost) {
      throw new BadRequestException('시리즈의 게시물을 찾을 수 없습니다.');
    }

    await this.drizzle
      .delete(seriesPosts)
      .where(eq(seriesPosts.id, seriesPost.id));
  }
}