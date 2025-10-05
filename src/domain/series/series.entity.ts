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
  private constructor(
    readonly id: SeriesID,
    readonly userId: UserID,
    readonly name: string,
    readonly slug: string,
    readonly description: string | null,
    readonly status: string,
    readonly isPublishedYn: YN,
    readonly publishedAt: Date,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) { }

  static create(param: CreateSeriesParam): SeriesEntity {
    return new SeriesEntity(
      0, // id: 0 means new entity
      param.userId,
      param.name,
      param.slug,
      param.description,
      param.status,
      param.isPublishedYn,
      param.publishedAt,
      new Date(), // createdAt
      new Date(), // updatedAt
    );
  }

  static fromRaw(data: SelectSeries): SeriesEntity {
    return new SeriesEntity(
      data.id,
      data.userId,
      data.name,
      data.slug,
      data.description,
      data.status,
      data.isPublishedYn,
      data.publishedAt,
      data.createdAt,
      data.updatedAt,
    );
  }

  isNew(): boolean {
    return this.id === 0;
  }

  update(params: UpdateSeriesParam): SeriesEntity {
    return new SeriesEntity(
      this.id,
      this.userId,
      params.name ?? this.name,
      params.slug ?? this.slug,
      params.description ?? this.description,
      params.status ?? this.status,
      params.isPublishedYn ?? this.isPublishedYn,
      params.publishedAt ?? this.publishedAt,
      this.createdAt,
      new Date(),
    );
  }

  toInsertData() {
    return {
      userId: this.userId,
      name: this.name,
      slug: this.slug,
      description: this.description,
      status: this.status,
      isPublishedYn: this.isPublishedYn,
      publishedAt: this.publishedAt,
    };
  }

  toUpdateData() {
    return {
      name: this.name,
      slug: this.slug,
      description: this.description,
      status: this.status,
      isPublishedYn: this.isPublishedYn,
      publishedAt: this.publishedAt,
      updatedAt: this.updatedAt,
    };
  }
}
