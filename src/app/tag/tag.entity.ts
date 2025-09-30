import { SelectTag } from "src/shared/drizzle";
import { UserID } from "../user";

export type TagID = number;

export type CreateTagParam = {
  readonly userId: UserID;
  readonly name: string;
  readonly description: string;
}

export class TagEntity implements SelectTag {
  private constructor(
    readonly id: TagID,
    readonly userId: UserID,
    readonly name: string,
    readonly description: string,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) { }

  static fromRaw(data: SelectTag) {
    return new TagEntity(
      data.id,
      data.userId,
      data.name,
      data.description,
      data.createdAt,
      data.updatedAt
    );
  }
}