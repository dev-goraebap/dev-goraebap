import { and, eq, ne } from "drizzle-orm";
import { PostEntity, PostID, PostRepository } from "src/domain/post";
import { DrizzleContext, posts } from "src/shared/drizzle";

export class PostRepositoryImpl implements PostRepository {
  async findById(id: PostID): Promise<PostEntity | null> {
    const result = await DrizzleContext.db().query.posts.findFirst({
      where: eq(posts.id, id)
    });
    return result ? PostEntity.fromRaw(result) : null;
  }

  async findBySlug(slug: string): Promise<PostEntity | null> {
    const result = await DrizzleContext.db().query.posts.findFirst({
      where: eq(posts.slug, slug)
    });
    return result ? PostEntity.fromRaw(result) : null;
  }

  async checkSlugExists(slug: string, excludeId?: PostID): Promise<boolean> {
    const whereCondition = excludeId
      ? and(eq(posts.slug, slug), ne(posts.id, excludeId))
      : eq(posts.slug, slug);

    const result = await DrizzleContext.db().query.posts.findFirst({
      where: whereCondition
    });

    return !!result;
  }

  async save(post: PostEntity): Promise<PostEntity> {
    if (post.isNew()) {
      // INSERT
      const [raw] = await DrizzleContext.db()
        .insert(posts)
        .values({
          userId: post.userId,
          slug: post.slug,
          title: post.title,
          content: post.content,
          summary: post.summary,
          isPublishedYn: post.isPublishedYn,
          publishedAt: post.publishedAt,
          postType: post.postType,
        })
        .returning();
      return PostEntity.fromRaw(raw);
    } else {
      // UPDATE
      const [raw] = await DrizzleContext.db()
        .update(posts)
        .set({
          slug: post.slug,
          title: post.title,
          content: post.content,
          summary: post.summary,
          isPublishedYn: post.isPublishedYn,
          publishedAt: post.publishedAt,
          postType: post.postType,
        })
        .where(eq(posts.id, post.id))
        .returning();
      return PostEntity.fromRaw(raw);
    }
  }

  async delete(id: PostID): Promise<void> {
    await DrizzleContext.db()
      .delete(posts)
      .where(eq(posts.id, id));
  }
}
