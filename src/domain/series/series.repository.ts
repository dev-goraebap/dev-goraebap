import { SeriesEntity, SeriesID } from "./series.entity";

export const SERIES_REPO = Symbol('SERIES_REPO');

export interface SeriesRepository {
  findById(id: SeriesID): Promise<SeriesEntity | null>;
  findByName(name: string): Promise<SeriesEntity | null>;
  checkNameExists(name: string, excludeId?: SeriesID): Promise<boolean>;

  save(series: SeriesEntity): Promise<SeriesEntity>;
  delete(id: SeriesID): Promise<void>;
}
