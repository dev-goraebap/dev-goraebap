import { DrizzleContext, postTags, SelectPostTag } from "src/shared/drizzle";
import { TagID } from "src/app/tag";

export class PostTagEntity implements SelectPostTag {
  private constructor(
    readonly postId: number,
    readonly tagId: number
  ) { }

  static fromRaw(data: SelectPostTag) {
    return new PostTagEntity(
      data.postId,
      data.tagId
    );
  }

  /**
   * 포스트와 태그를 연결
   */
  static async link(postId: number, tagIds: TagID[]): Promise<PostTagEntity[]> {
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