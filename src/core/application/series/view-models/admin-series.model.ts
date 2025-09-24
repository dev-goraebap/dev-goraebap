import { ThumbnailModel } from "../../_concern";

export class SeriesModel {
  // DEFAULT
  id: number;
  name: string;
  description: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  userId: number | null;
  slug: string;
  publishedAt: string;
  isPublishedYn: string;

  // ADD
  postCount?: number;
  thumbnail?: ThumbnailModel;

  static from(data: SeriesModel, thumbnailModel?: ThumbnailModel): SeriesModel {
    return {
      ...data,
      postCount: data?.postCount ?? 0,
      thumbnail: thumbnailModel
    }
  }
}