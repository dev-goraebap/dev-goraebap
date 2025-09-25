import { Inject, Injectable } from "@nestjs/common";
import { desc, eq } from "drizzle-orm";

import { DRIZZLE, DrizzleOrm, posts } from "src/shared/drizzle";

@Injectable()
export class SitemapQueryService {

  constructor(
    @Inject(DRIZZLE)
    private readonly drizzle: DrizzleOrm
  ) {}

  getPosts() {
    return this.drizzle
      .select()
      .from(posts)
      .where(eq(posts.isPublishedYn, 'Y'))
      .orderBy(desc(posts.publishedAt));
  }
}