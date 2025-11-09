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
  readonly id!: PostID;
  readonly userId!: UserID;
  readonly slug!: string;
  readonly title!: string;
  readonly summary!: string;
  readonly content!: string;
  readonly postType!: string;
  readonly viewCount!: number;
  readonly isPublishedYn!: 'Y' | 'N';
  readonly publishedAt!: Date;
  readonly createdAt!: Date;
  readonly updatedAt!: Date;

  static create(param: CreatePostParam): PostEntity {
    return Object.assign(new PostEntity(), {
      id: 0, // id: 0 means new entity
      userId: param.userId,
      slug: param.slug,
      title: param.title,
      summary: param.summary,
      content: param.content,
      postType: param.postType,
      viewCount: 0,
      isPublishedYn: param.isPublishedYn,
      publishedAt: param.publishedAt,
      createdAt: new Date(),
      updatedAt: new Date(),
    } satisfies Partial<PostEntity>);
  }

  static fromRaw(data: SelectPost): PostEntity {
    return Object.assign(new PostEntity(), {
      id: data.id,
      userId: data.userId,
      slug: data.slug,
      title: data.title,
      summary: data.summary,
      content: data.content,
      postType: data.postType,
      viewCount: data.viewCount,
      isPublishedYn: data.isPublishedYn,
      publishedAt: data.publishedAt,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    } satisfies Partial<PostEntity>);
  }

  isNew(): boolean {
    return this.id === 0;
  }

  update(params: UpdatePostParam): PostEntity {
    return Object.assign(new PostEntity(), {
      id: this.id,
      userId: this.userId,
      slug: params.slug ?? this.slug,
      title: params.title ?? this.title,
      summary: params.summary ?? this.summary,
      content: params.content ?? this.content,
      postType: params.postType ?? this.postType,
      viewCount: this.viewCount,
      isPublishedYn: params.isPublishedYn ?? this.isPublishedYn,
      publishedAt: params.publishedAt ?? this.publishedAt,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    } satisfies Partial<PostEntity>);
  }

  incrementViewCount(): PostEntity {
    return Object.assign(new PostEntity(), {
      id: this.id,
      userId: this.userId,
      slug: this.slug,
      title: this.title,
      summary: this.summary,
      content: this.content,
      postType: this.postType,
      viewCount: this.viewCount + 1,
      isPublishedYn: this.isPublishedYn,
      publishedAt: this.publishedAt,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    } satisfies Partial<PostEntity>);
  }
}
