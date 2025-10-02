import { and, eq, ne } from "drizzle-orm";
import { CreatePostParam, PostEntity, PostID, PostRepository, UpdatePostParam } from "src/domain/post";
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

  async create(param: CreatePostParam): Promise<PostEntity> {
    const [raw] = await DrizzleContext.db()
      .insert(posts)
      .values({
        userId: param.userId,
        slug: param.slug,
        title: param.title,
        content: param.content,
        summary: param.summary,
        isPublishedYn: param.isPublishedYn,
        publishedAt: param.publishedAt,
        postType: param.postType,
      })
      .returning();
    return PostEntity.fromRaw(raw);
  }

  async update(id: PostID, param: UpdatePostParam): Promise<PostEntity> {
    const updateData: any = {};

    if (param.slug !== undefined) updateData.slug = param.slug;
    if (param.title !== undefined) updateData.title = param.title;
    if (param.content !== undefined) updateData.content = param.content;
    if (param.summary !== undefined) updateData.summary = param.summary;
    if (param.isPublishedYn !== undefined) updateData.isPublishedYn = param.isPublishedYn;
    if (param.publishedAt !== undefined) updateData.publishedAt = param.publishedAt;
    if (param.postType !== undefined) updateData.postType = param.postType;

    const [raw] = await DrizzleContext.db()
      .update(posts)
      .set(updateData)
      .where(eq(posts.id, id))
      .returning();

    return PostEntity.fromRaw(raw);
  }

  async delete(id: PostID): Promise<void> {
    await DrizzleContext.db()
      .delete(posts)
      .where(eq(posts.id, id));
  }
}
