import { SelectPost } from "src/shared/drizzle";
import { ThumbnailModel } from "../../_concern";

export class PostModel implements SelectPost {
  id: number;
  slug: string;
  title: string;
  summary: string;
  content: string;
  postType: string;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  userId: number | null;
  isPublishedYn: string;
  
  commentCount?: number;
  seriesPostId?: number;
  seriesSlug?: string;
  thumbnail?: ThumbnailModel;

  static from(dto: PostModel, thumbnail?: ThumbnailModel) {
    return {
      ...dto,
      thumbnail
    }
  }
}