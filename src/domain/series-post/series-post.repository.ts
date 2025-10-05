import { SeriesPostEntity, SeriesPostID } from "./series-post.entity";

export const SERIES_POST_REPO = Symbol('SERIES_POST_REPO');

export interface SeriesPostRepository {
  findById(id: SeriesPostID): Promise<SeriesPostEntity | null>;
  findByIds(ids: SeriesPostID[]): Promise<SeriesPostEntity[]>;
  find(seriesId: number, postId: number): Promise<SeriesPostEntity | null>;

  save(seriesPost: SeriesPostEntity): Promise<SeriesPostEntity>;
  saveMany(seriesPosts: SeriesPostEntity[]): Promise<void>;
  delete(id: SeriesPostID): Promise<void>;
}
