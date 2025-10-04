import { YN } from "src/domain/_concern";
import { SelectSeries } from "src/shared/drizzle";
import { ThumbnailModel } from "./thumbnail.model";

export class SeriesReadModel implements Partial<SelectSeries> {
  readonly id?: number;
  readonly name?: string;
  readonly slug?: string;
  readonly description?: string | null;
  readonly status?: string;
  readonly isPublishedYn?: YN;
  readonly publishedAt?: Date;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
  readonly userId?: number;
  readonly thumbnail?: ThumbnailModel;
  readonly postCount?: number;

  static from(data: Partial<SelectSeries>, thumbnail?: ThumbnailModel): SeriesReadModel {
    return {
      ...data,
      thumbnail
    }
  }
}
