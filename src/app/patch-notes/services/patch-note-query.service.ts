import { Inject, Injectable } from '@nestjs/common';
import { and, desc, eq, getTableColumns, not, sql } from 'drizzle-orm';

import { PostModel, ThumbnailModel } from 'src/app/_concern';
import { getCommentCountSubquery } from 'src/features/comment';
import { CloudflareR2Service } from 'src/shared/cloudflare-r2';
import { DRIZZLE, DrizzleOrm, getThumbnailSubquery, posts } from 'src/shared/drizzle';


@Injectable()
export class PatchNoteQueryService {
  constructor(
    @Inject(DRIZZLE)
    private readonly drizzle: DrizzleOrm,
    private readonly r2Service: CloudflareR2Service
  ) { }

  async getPatchNotes() {
    const thumbnailSubquery = getThumbnailSubquery(this.drizzle);
    const commentCountSubquery = getCommentCountSubquery(this.drizzle);

    const rawPosts = await this.drizzle
      .select({
        ...getTableColumns(posts),
        ...thumbnailSubquery.columns,
        ...commentCountSubquery.columns
      })
      .from(posts)
      .leftJoin(thumbnailSubquery.qb, and(
        eq(thumbnailSubquery.qb.recordType, 'post'),
        eq(thumbnailSubquery.qb.recordId, sql`CAST(${posts.id} AS TEXT)`),
      ))
      .leftJoin(commentCountSubquery.qb, eq(commentCountSubquery.qb.postId, posts.id))
      .where(and(
        eq(posts.isPublishedYn, 'Y'),
        eq(posts.postType, 'patch-note'),
      ))
      .orderBy(desc(posts.publishedAt));

    return rawPosts.map(x => {
      if (x.file) {
        const url = this.r2Service.getPublicUrl(x.file.key);
        const thumbnailModel = ThumbnailModel.from(url, x.file.metadata);
        return PostModel.from(x, thumbnailModel);
      }
      return PostModel.from(x);
    });
  }

  async getOtherPatchNotes(excludeSlug: string) {
    const thumbnailSubquery = getThumbnailSubquery(this.drizzle);
    const commentCountSubquery = getCommentCountSubquery(this.drizzle);

    const rawPosts = await this.drizzle
      .select({
        ...getTableColumns(posts),
        ...thumbnailSubquery.columns,
        ...commentCountSubquery.columns
      })
      .from(posts)
      .leftJoin(thumbnailSubquery.qb, and(
        eq(thumbnailSubquery.qb.recordType, 'post'),
        eq(thumbnailSubquery.qb.recordId, sql`CAST(${posts.id} AS TEXT)`),
      ))
      .leftJoin(commentCountSubquery.qb, eq(commentCountSubquery.qb.postId, posts.id))
      .where(and(
        eq(posts.isPublishedYn, 'Y'),
        eq(posts.postType, 'patch-note'),
        not(eq(posts.slug, excludeSlug))
      ))
      .orderBy(desc(posts.publishedAt));

    return rawPosts.map(x => {
      if (x.file) {
        const url = this.r2Service.getPublicUrl(x.file.key);
        const thumbnailModel = ThumbnailModel.from(url, x.file.metadata);
        return PostModel.from(x, thumbnailModel);
      }
      return PostModel.from(x);
    });
  }
}