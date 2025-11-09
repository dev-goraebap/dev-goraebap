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
  readonly id!: SeriesPostID;
  readonly seriesId!: SeriesID;
  readonly postId!: PostID;
  readonly order!: number;
  readonly createdAt!: Date;
  readonly updatedAt!: Date;

  static create(param: CreateSeriesPostParam): SeriesPostEntity {
    return Object.assign(new SeriesPostEntity(), {
      id: 0, // id: 0 means new entity
      seriesId: param.seriesId,
      postId: param.postId,
      order: param.order ?? 999,
      createdAt: new Date(),
      updatedAt: new Date(),
    } satisfies Partial<SeriesPostEntity>);
  }

  static fromRaw(data: SelectSeriesPost): SeriesPostEntity {
    return Object.assign(new SeriesPostEntity(), {
      id: data.id,
      seriesId: data.seriesId,
      postId: data.postId,
      order: data.order,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    } satisfies Partial<SeriesPostEntity>);
  }

  isNew(): boolean {
    return this.id === 0;
  }

  updateOrder(newOrder: number): SeriesPostEntity {
    return Object.assign(new SeriesPostEntity(), {
      id: this.id,
      seriesId: this.seriesId,
      postId: this.postId,
      order: newOrder,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    } satisfies Partial<SeriesPostEntity>);
  }
}
