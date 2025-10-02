import { SelectPost } from "src/shared/drizzle";
import { UserID } from "../user";

export type PostID = number;

export type CreatePostParam = {
  readonly userId: UserID;
  readonly slug: string;
  readonly title: string;
  readonly summary: string;
  readonly content: string;
  readonly postType: string;
  readonly isPublishedYn: 'Y' | 'N';
  readonly publishedAt: Date;
}

export type UpdatePostParam = {
  readonly slug?: string;
  readonly title?: string;
  readonly summary?: string;
  readonly content?: string;
  readonly postType?: string;
  readonly isPublishedYn?: 'Y' | 'N';
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

  get isPublished(): boolean {
    return this.isPublishedYn === 'Y';
  }

  get contentImages(): string[] {
    const imageUrls: string[] = [];
    const imgRegex = /<img[^>]+src="([^">]+)"/g;
    let match;

    while ((match = imgRegex.exec(this.content)) !== null) {
      imageUrls.push(match[1]);
    }

    return imageUrls;
  }

  get blobKeysFromContent(): string[] {
    const blobKeys: string[] = this.contentImages
      .map((url) => url.match(/([a-f0-9]{32})$/)?.[1])
      .filter(Boolean) as string[];

    return blobKeys;
  }
}
