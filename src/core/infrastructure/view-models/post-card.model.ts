import { ThumbnailModel } from './thumbnail.model';

export class PostCardModel {
  readonly id: number;
  readonly title: string;
  readonly summary: string;
  readonly publishedAt: Date;
  readonly viewCount: number;
  readonly thumbnail?: ThumbnailModel;
  readonly tags: {
    id: number;
    name: string;
  }[];

  static fromRaw(data: any, thumbnail?: ThumbnailModel): PostCardModel {
    const tags = data.tags ? (typeof data.tags === 'string' ? JSON.parse(data.tags) : data.tags) : [];
    return {
      id: data.id,
      title: data.title,
      summary: data.summary,
      publishedAt: data.published_at,
      viewCount: data.view_count,
      thumbnail,
      tags,
    };
  }
}