import { YN } from "src/domain/_concern";
import { SelectPost } from "src/shared/drizzle";
import { ThumbnailModel } from "./thumbnail.model";

export class PostReadModel implements Partial<SelectPost> {
  readonly id?: number;
  readonly slug?: string;
  readonly title?: string;
  readonly summary?: string;
  readonly content?: string;
  readonly postType?: string;
  readonly viewCount?: number;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
  readonly publishedAt?: Date;
  readonly userId?: number;
  readonly isPublishedYn?: YN;
  readonly thumbnail?: ThumbnailModel;
  readonly commentCount?: number;

  static from(data: Partial<SelectPost>, thumbnail?: ThumbnailModel): PostReadModel {
    return {
      ...data,
      thumbnail
    }
  }
}