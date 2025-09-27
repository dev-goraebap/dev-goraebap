import { TagEntity } from "./tag.entity";

export const TAG_REPO = Symbol('TAG_REPO');

export interface ITagRepository {
  findByName(name: string): Promise<TagEntity | null>;
  save(tag: TagEntity): Promise<TagEntity>;
  saveMany(tags: TagEntity[]): Promise<TagEntity[]>;
}