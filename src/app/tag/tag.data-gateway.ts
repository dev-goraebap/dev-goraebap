import { Injectable } from "@nestjs/common";
import { inArray } from "drizzle-orm";

import { DrizzleContext, tags } from "src/shared/drizzle";
import { CreateTagParam, TagEntity } from "./tag.entity";

@Injectable()
export class TagDataGateway {

  async findByNames(names: string[]): Promise<TagEntity[]> {
    const rawTags = await DrizzleContext.db()
      .select()
      .from(tags)
      .where(inArray(tags.name, names));
    return rawTags.map(x => TagEntity.fromRaw(x));
  }

  async insertMany(values: CreateTagParam[]): Promise<TagEntity[]> {
    const rawTags = await DrizzleContext.db()
      .insert(tags)
      .values(values)
      .returning();
    return rawTags.map(x => TagEntity.fromRaw(x));
  }
}