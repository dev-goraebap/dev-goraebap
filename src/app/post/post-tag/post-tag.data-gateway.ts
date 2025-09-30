import { DrizzleContext, postTags } from "src/shared/drizzle";
import { PostTagEntity } from "./post-tag.entity";

export class PostTagDataGateway {
  async insertMany(values: { postId: number, tagId: number }[]): Promise<PostTagEntity[]> {
    const rawPostTags = await DrizzleContext.db()
      .insert(postTags)
      .values(values)
      .returning();
    return rawPostTags.map(x => PostTagEntity.fromRaw(x));
  }
}