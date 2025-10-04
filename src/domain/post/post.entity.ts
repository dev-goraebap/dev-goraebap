import { SelectPost } from "src/shared/drizzle";
import { YN } from "../_concern";
import { UserID } from "../user";

export type PostID = number;

export type CreatePostParam = {
  readonly userId: UserID;
  readonly slug: string;
  readonly title: string;
  readonly summary: string;
  readonly content: string;
  readonly postType: string;
  readonly isPublishedYn: YN;
  readonly publishedAt: Date;
}

export type UpdatePostParam = {
  readonly slug?: string;
  readonly title?: string;
  readonly summary?: string;
  readonly content?: string;
  readonly postType?: string;
  readonly isPublishedYn?: YN;
  readonly publishedAt?: Date;
}

export class PostEntity implements SelectPost {
  private constructor(
    readonly id: PostID,
    readonly userId: UserID,
    readonly slug: string,
    readonly title: string,
    readonly summary: string,
    readonly content: string,
    readonly postType: string,
    readonly viewCount: number,
    readonly isPublishedYn: 'Y' | 'N',
    readonly publishedAt: Date,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) { }

  static create(param: CreatePostParam): PostEntity {
    return new PostEntity(
      0, // id: 0 means new entity
      param.userId,
      param.slug,
      param.title,
      param.summary,
      param.content,
      param.postType,
      0, // viewCount
      param.isPublishedYn,
      param.publishedAt,
      new Date(), // createdAt
      new Date(), // updatedAt
    );
  }

  static fromRaw(data: SelectPost): PostEntity {
    return new PostEntity(
      data.id,
      data.userId,
      data.slug,
      data.title,
      data.summary,
      data.content,
      data.postType,
      data.viewCount,
      data.isPublishedYn,
      data.publishedAt,
      data.createdAt,
      data.updatedAt,
    );
  }

  isNew(): boolean {
    return this.id === 0;
  }

  update(params: UpdatePostParam): PostEntity {
    return new PostEntity(
      this.id,
      this.userId,
      params.slug ?? this.slug,
      params.title ?? this.title,
      params.summary ?? this.summary,
      params.content ?? this.content,
      params.postType ?? this.postType,
      this.viewCount,
      params.isPublishedYn ?? this.isPublishedYn,
      params.publishedAt ?? this.publishedAt,
      this.createdAt,
      new Date(),
    );
  }

  incrementViewCount(): PostEntity {
    return new PostEntity(
      this.id,
      this.userId,
      this.slug,
      this.title,
      this.summary,
      this.content,
      this.postType,
      this.viewCount + 1,
      this.isPublishedYn,
      this.publishedAt,
      this.createdAt,
      new Date(),
    );
  }

  toInsertData() {
    return {
      userId: this.userId,
      slug: this.slug,
      title: this.title,
      summary: this.summary,
      content: this.content,
      postType: this.postType,
      isPublishedYn: this.isPublishedYn,
      publishedAt: this.publishedAt,
    };
  }

  toUpdateData() {
    return {
      slug: this.slug,
      title: this.title,
      summary: this.summary,
      content: this.content,
      postType: this.postType,
      viewCount: this.viewCount,
      isPublishedYn: this.isPublishedYn,
      publishedAt: this.publishedAt,
      updatedAt: this.updatedAt,
    };
  }
}
