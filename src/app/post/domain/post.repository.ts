import { TagEntity } from "src/app/tag";
import { PostEntity } from "./post.entity";

export const POST_REPO = Symbol('POST_REPO');

export interface IPostRepository {
  findBySlug(slug: string): Promise<PostEntity | null>;
  create(postEntity: PostEntity): Promise<PostEntity>;
  update(postEntity: PostEntity): Promise<void>;
  attachTags(postEntity: PostEntity, tags: TagEntity[]): Promise<void>;
}