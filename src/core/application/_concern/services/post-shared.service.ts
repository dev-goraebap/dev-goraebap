import { Inject, Injectable } from '@nestjs/common';
import { desc, eq } from 'drizzle-orm';

import { DRIZZLE, DrizzleOrm, posts } from 'src/shared/drizzle';

@Injectable()
export class PostSharedService {
  constructor(
    @Inject(DRIZZLE)
    private readonly drizzle: DrizzleOrm,
  ) {}

  async findById(id: number) {
    return await this.drizzle.query.posts.findFirst({
      where: eq(posts.id, id)
    });
  }

  async getPublishedPosts() {
    return await this.drizzle
      .select({
        slug: posts.slug,
        updatedAt: posts.updatedAt,
        publishedAt: posts.publishedAt,
      })
      .from(posts)
      .where(eq(posts.isPublishedYn, 'Y'))
      .orderBy(desc(posts.publishedAt));
  }
}
