import { PostEntity, PostID } from "./post.entity";

export const POST_REPO = Symbol('POST_REPO');

export interface PostRepository {
  findById(id: PostID): Promise<PostEntity | null>;
  findBySlug(slug: string): Promise<PostEntity | null>;
  checkSlugExists(slug: string, excludeId?: PostID): Promise<boolean>;

  save(post: PostEntity): Promise<PostEntity>;
  delete(id: PostID): Promise<void>;
}
