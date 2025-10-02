import { CreatePostParam, PostEntity, PostID, UpdatePostParam } from "./post.entity";

export const POST_REPO = Symbol('POST_REPO');

export interface PostRepository {
  findById(id: PostID): Promise<PostEntity | null>;
  findBySlug(slug: string): Promise<PostEntity | null>;
  checkSlugExists(slug: string, excludeId?: PostID): Promise<boolean>;

  create(param: CreatePostParam): Promise<PostEntity>;
  update(id: PostID, param: UpdatePostParam): Promise<PostEntity>;
  delete(id: PostID): Promise<void>;
}
