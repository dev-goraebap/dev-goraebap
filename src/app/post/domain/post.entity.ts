import { ThumbnailModel, YN } from "src/app/_concern";
import { UserID } from "src/app/user";
import { PostContentVO } from "./value-objects";

export type PostID = number;

export type PostData = {
  readonly id: PostID;
  readonly userId: UserID;
  readonly slug: string;
  readonly title: string;
  readonly summary: string;
  readonly content: string;
  readonly postType: string;
  readonly viewCount: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly publishedAt: Date;
  readonly isPublishedYn: YN;
  // view data
  readonly thumbnail?: ThumbnailModel;
}

export type CreatePostParam = {
  readonly userId: UserID;
  readonly slug: string;
  readonly postType: string;
  readonly content: string;
  readonly isPublishedYn: YN;
  readonly publishedAt: Date;
}

export class PostEntity implements PostData {
  readonly id: PostID;
  readonly userId: UserID;
  readonly slug: string;
  readonly title: string;
  readonly summary: string;
  readonly content: string;
  readonly postType: string;
  readonly viewCount: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly publishedAt: Date;
  readonly isPublishedYn: YN;
  readonly thumbnail?: ThumbnailModel;

  private constructor() { }

  static create(param: CreatePostParam): PostEntity {
    const postContent = new PostContentVO(param.content);
    const post = new PostEntity();
    Object.assign(post, {
      userId: param.userId,
      slug: param.slug,
      title: postContent.title,
      content: postContent.htmlContent,
      postType: param.postType,
      viewCount: 0,
      publishedAt: param.publishedAt || new Date(),
      isPublishedYn: param.isPublishedYn,
    });
    return post;
  }

  static fromRaw(data: PostData): PostEntity {
    const post = new PostEntity();
    Object.assign(post, data);
    return post;
  }

  withUpdateViewCount(): PostEntity {
    const updatedData: PostData = {
      ...this,
      viewCount: this.viewCount + 1,
      updatedAt: new Date(),
    };
    const post = new PostEntity();
    Object.assign(post, updatedData);
    return post;
  }
}