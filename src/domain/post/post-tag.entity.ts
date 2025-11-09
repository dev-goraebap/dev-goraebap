import { eq } from "drizzle-orm";
import { TagID } from "src/domain/tag";
import { DrizzleContext, postTags, SelectPostTag } from "src/shared/drizzle";

export class PostTagEntity implements SelectPostTag {
  readonly postId!: number;
  readonly tagId!: number;

  static fromRaw(data: SelectPostTag): PostTagEntity {
    return Object.assign(new PostTagEntity(), {
      postId: data.postId,
      tagId: data.tagId,
    } satisfies Partial<PostTagEntity>);
  }

  /**
   * 포스트와 태그를 연결 (기존 태그는 모두 삭제 후 재연결)
   */
  static async link(postId: number, tagIds: TagID[]): Promise<PostTagEntity[]> {
    // 1. 기존 태그 관계 모두 삭제
    await DrizzleContext.db()
      .delete(postTags)
      .where(eq(postTags.postId, postId));

    // 2. 새로운 태그 연결 (빈 배열이면 삭제만 수행)
    if (tagIds.length === 0) {
      return [];
    }

    const linkData = tagIds.map(tagId => ({
      postId,
      tagId
    }));

    const rawPostTags = await DrizzleContext.db()
      .insert(postTags)
      .values(linkData)
      .returning();

    return rawPostTags.map(raw => PostTagEntity.fromRaw(raw));
  }
}