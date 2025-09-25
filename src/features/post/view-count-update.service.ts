import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { eq, sql } from "drizzle-orm";

import { DRIZZLE, DrizzleOrm, posts } from "src/shared/drizzle";

@Injectable()
export class ViewCountUpdateService {

  constructor(
    @Inject(DRIZZLE)
    private readonly drizzle: DrizzleOrm
  ) { }

  async update(slug: string) {
    const result = await this.drizzle
      .update(posts)
      .set({
        viewCount: sql`${posts.viewCount} + 1`
      })
      .where(eq(posts.slug, slug))
      .returning({ id: posts.id });

    if (result.length === 0) {
      throw new BadRequestException('조회수 업데이트에 실패하였습니다.');
    }
  }
}