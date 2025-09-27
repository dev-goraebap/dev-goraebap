import { Inject, Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";

import { IPostRepository, PostEntity } from "src/app/post";
import { TagEntity } from "src/app/tag";
import { DRIZZLE, DrizzleOrm, posts } from "src/shared/drizzle";
import { PostMapper } from "../mappers/post.mapper";

@Injectable()
export class PostRepository implements IPostRepository {

  constructor(
    @Inject(DRIZZLE)
    private readonly drizzle: DrizzleOrm
  ) { }

  async findBySlug(slug: string): Promise<PostEntity | null> {
    const [rawPost] = await this.drizzle
      .select()
      .from(posts)
      .where(eq(posts.slug, slug));

    if (!rawPost) return null;

    return PostMapper.toEntity(rawPost);
  }

  async create(postEntity: PostEntity): Promise<PostEntity> {
    throw new Error("Method not implemented.");
  }

  async update(postEntity: PostEntity): Promise<void> {
    throw new Error("Method not implemented.");
  }

  attachTags(postEntity: PostEntity, tags: TagEntity[]): Promise<void> {
    throw new Error("Method not implemented.");
  }
}