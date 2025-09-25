import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";

import { DRIZZLE, DrizzleOrm, SelectTag, tags, UserId } from "src/shared/drizzle";
import { LoggerService } from "src/shared/logger";
import { CreateOrUpdateTagDto } from "../dto/create-or-update-tag.dto";

@Injectable()
export class TagCommandService {

  constructor(
    @Inject(DRIZZLE)
    private readonly drizzle: DrizzleOrm,
    private readonly logger: LoggerService
  ) { }

  async createTag(userId: UserId, dto: CreateOrUpdateTagDto): Promise<SelectTag> {
    const existsTag = await this.drizzle.query.tags.findFirst({
      where: eq(tags.name, dto.name)
    });
    if (existsTag) {
      throw new BadRequestException('이미 사용중인 태그명 입니다.');
    }

    try {
      return (await this.drizzle.insert(tags).values({
        userId,
        name: dto.name,
        description: dto.description ?? ''
      }).returning())[0];
    } catch (err) {
      this.logger.error(err);
      throw new BadRequestException(err);
    }
  }

  async updateTag(id: number, dto: CreateOrUpdateTagDto): Promise<SelectTag> {
    const tag = await this.drizzle.query.tags.findFirst({
      where: eq(tags.id, id)
    })
    if (!tag) {
      throw new BadRequestException('태그가 존재하지 않습니다.');
    }

    try {
      return (await this.drizzle
        .update(tags)
        .set({
          name: dto.name,
          description: dto.description ?? tag.description,
        })
        .where(eq(tags.id, id))
        .returning())[0];
    } catch (err) {
      this.logger.error(err);
      throw new BadRequestException(err);
    }
  }

  async destroyTag(id: number): Promise<{ id: number }> {
    const tag = await this.drizzle.query.tags.findFirst({
      where: eq(tags.id, id)
    })
    if (!tag) {
      throw new BadRequestException('태그가 존재하지 않습니다.');
    }

    try {
      return (await this.drizzle
        .delete(tags)
        .where(eq(tags.id, id))
        .returning({ id: tags.id }))[0];
    } catch (err) {
      this.logger.error(err);
      throw new BadRequestException(err);
    }
  }
}