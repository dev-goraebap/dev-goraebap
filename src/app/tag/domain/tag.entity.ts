import { UserID } from "src/app/user";

export type TagID = number;

export type CreateTagParam = {
  readonly userId: UserID;
  readonly name: string;
  readonly description: string;
}

export type TagData = {
  readonly id: TagID;
  readonly userId: UserID;
  readonly name: string;
  readonly description?: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export class TagEntity implements TagData {
  readonly id: TagID;
  readonly userId: UserID;
  readonly name: string;
  readonly description?: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  private constructor() { }

  static create(param: CreateTagParam) {
    const tag = new TagEntity();
    Object.assign(tag, {
      userId: param.userId,
      name: param.name,
      description: param.description,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return tag;
  }

  static from(data: TagData) {
    const tag = new TagEntity();
    Object.assign(tag, data);
    return tag;
  }
}