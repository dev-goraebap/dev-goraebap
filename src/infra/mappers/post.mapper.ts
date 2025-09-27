import { ThumbnailModel } from "src/app/_concern";
import { PostEntity } from "src/app/post";
import { SelectPost } from "src/shared/drizzle";

export class PostMapper {
  static toEntity(data: SelectPost, thumbnail?: ThumbnailModel): PostEntity {
    return PostEntity.fromRaw({
      ...data,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
      publishedAt: new Date(data.publishedAt),
      thumbnail,
    });
  }
}