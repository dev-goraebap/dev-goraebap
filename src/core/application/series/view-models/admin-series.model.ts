import { ThumbnailModel } from "../../_concern";

export class AdminSeriesModel {
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

  static from(data: AdminSeriesModel, thumbnailModel?: ThumbnailModel): AdminSeriesModel {
    return {
      ...data,
      thumbnail: thumbnailModel
    }
  }
}