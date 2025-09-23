import { ThumbnailModel } from "../../_concern";

export class AdminSeriesPostModel {
  seriesPostId: number;
  id: number;
  title: string;
  isPublishedYn: string;
  thumbnail?: ThumbnailModel;

  static from(dto: AdminSeriesPostModel, thumbnail?: ThumbnailModel) {
    return {
      ...dto,
      thumbnail
    }
  }
}