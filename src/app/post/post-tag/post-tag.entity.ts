import { SelectPostTag } from "src/shared/drizzle";

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
}