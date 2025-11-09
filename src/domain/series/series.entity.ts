import { SelectSeries } from "src/shared/drizzle";
import { YN } from "../_concern";
import { UserID } from "../user";

export type SeriesID = number;

export type CreateSeriesParam = {
  readonly userId: UserID;
  readonly name: string;
  readonly slug: string;
  readonly description: string;
  readonly status: string;
  readonly isPublishedYn: YN;
  readonly publishedAt: Date;
}

export type UpdateSeriesParam = {
  readonly name?: string;
  readonly slug?: string;
  readonly description?: string;
  readonly status?: string;
  readonly isPublishedYn?: YN;
  readonly publishedAt?: Date;
}

export class SeriesEntity implements SelectSeries {
  readonly id!: SeriesID;
  readonly userId!: UserID;
  readonly name!: string;
  readonly slug!: string;
  readonly description!: string | null;
  readonly status!: string;
  readonly isPublishedYn!: YN;
  readonly publishedAt!: Date;
  readonly createdAt!: Date;
  readonly updatedAt!: Date;

  static create(param: CreateSeriesParam): SeriesEntity {
    return Object.assign(new SeriesEntity(), {
      id: 0, // id: 0 means new entity
      userId: param.userId,
      name: param.name,
      slug: param.slug,
      description: param.description,
      status: param.status,
      isPublishedYn: param.isPublishedYn,
      publishedAt: param.publishedAt,
      createdAt: new Date(),
      updatedAt: new Date(),
    } satisfies Partial<SeriesEntity>);
  }

  static fromRaw(data: SelectSeries): SeriesEntity {
    return Object.assign(new SeriesEntity(), {
      id: data.id,
      userId: data.userId,
      name: data.name,
      slug: data.slug,
      description: data.description,
      status: data.status,
      isPublishedYn: data.isPublishedYn,
      publishedAt: data.publishedAt,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    } satisfies Partial<SeriesEntity>);
  }

  isNew(): boolean {
    return this.id === 0;
  }

  update(params: UpdateSeriesParam): SeriesEntity {
    return Object.assign(new SeriesEntity(), {
      id: this.id,
      userId: this.userId,
      name: params.name ?? this.name,
      slug: params.slug ?? this.slug,
      description: params.description ?? this.description,
      status: params.status ?? this.status,
      isPublishedYn: params.isPublishedYn ?? this.isPublishedYn,
      publishedAt: params.publishedAt ?? this.publishedAt,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    } satisfies Partial<SeriesEntity>);
  }
}
