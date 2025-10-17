import { SelectCuratedItem } from "src/shared/drizzle";

export class CuratedItemReadModel implements SelectCuratedItem {
  readonly id: number;
  readonly link: string;
  readonly createdAt: Date;
  readonly title: string;
  readonly guid: string;
  readonly snippet: string | null;
  readonly pubDate: Date;
  readonly source: string;
  readonly sourceId: number | null;

  static from(data: Partial<CuratedItemReadModel>): Partial<CuratedItemReadModel> {
    return {
      ...data
    }
  }
}
