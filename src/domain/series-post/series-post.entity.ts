import { SelectSeriesPost } from "src/shared/drizzle";
import { SeriesID } from "../series";
import { PostID } from "../post";

export type SeriesPostID = number;

export type CreateSeriesPostParam = {
  readonly seriesId: SeriesID;
  readonly postId: PostID;
  readonly order?: number;
}

export class SeriesPostEntity implements SelectSeriesPost {
  private constructor(
    readonly id: SeriesPostID,
    readonly seriesId: SeriesID,
    readonly postId: PostID,
    readonly order: number,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) { }

  static create(param: CreateSeriesPostParam): SeriesPostEntity {
    return new SeriesPostEntity(
      0, // id: 0 means new entity
      param.seriesId,
      param.postId,
      param.order ?? 999,
      new Date(),
      new Date(),
    );
  }

  static fromRaw(data: SelectSeriesPost): SeriesPostEntity {
    return new SeriesPostEntity(
      data.id,
      data.seriesId,
      data.postId,
      data.order,
      data.createdAt,
      data.updatedAt,
    );
  }

  isNew(): boolean {
    return this.id === 0;
  }

  updateOrder(newOrder: number): SeriesPostEntity {
    return new SeriesPostEntity(
      this.id,
      this.seriesId,
      this.postId,
      newOrder,
      this.createdAt,
      new Date(),
    );
  }

  toInsertData() {
    return {
      seriesId: this.seriesId,
      postId: this.postId,
      order: this.order,
    };
  }

  toUpdateData() {
    return {
      order: this.order,
      updatedAt: this.updatedAt,
    };
  }
}
