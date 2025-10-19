import { BadRequestException, Injectable } from '@nestjs/common';
import { asc, count, desc, eq, like } from 'drizzle-orm';

import { DrizzleContext, posts, postTags, SelectTag, tags } from 'src/shared/drizzle';
import { GetAdminTagsDto } from '../dto/get-admin-tags.dto';
import { PaginationModel } from '../read-models';

@Injectable()
export class TagQueryService {

  async getFeedTags(): Promise<{
    id: number;
    name: string;
    postCount: number;
  }[]> {
    return await DrizzleContext.db()
      .select({
        id: tags.id,
        name: tags.name,
        postCount: count(posts)
      })
      .from(tags)
      .leftJoin(postTags, eq(postTags.tagId, tags.id))
      .leftJoin(posts, eq(posts.id, postTags.postId))
      .groupBy(tags.id, tags.name)
      .orderBy(tags.name);
  }

  async getAdminTagsWithPagination(dto: GetAdminTagsDto): Promise<PaginationModel<SelectTag>> {
    // 검색 조건 설정
    const whereCondition = dto.search
      ? like(tags.name, `%${dto.search}%`)
      : undefined;

    // 정렬 설정
    const orderCondition = dto.orderBy === 'ASC'
      ? asc(tags[dto.orderKey])
      : desc(tags[dto.orderKey]);

    // 페이지네이션 계산
    const offset = (dto.page - 1) * dto.perPage;

    // 메인 쿼리 (데이터)
    const tagsQuery = DrizzleContext.db()
      .select({
        id: tags.id,
        name: tags.name,
        description: tags.description,
        createdAt: tags.createdAt,
        updatedAt: tags.updatedAt,
        postCount: count()
      })
      .from(tags)
      .leftJoin(postTags, eq(postTags.tagId, tags.id))
      .where(whereCondition)
      .groupBy(tags.id, tags.name, tags.description, tags.createdAt, tags.updatedAt)
      .orderBy(orderCondition)
      .limit(dto.perPage)
      .offset(offset);

    // 총 개수 쿼리
    const countQuery = DrizzleContext.db()
      .select({ count: count() })
      .from(tags)
      .where(whereCondition);

    // 병렬 실행
    const [raws, totalRaws] = await Promise.all([
      tagsQuery,
      countQuery
    ]);
    const total = totalRaws[0].count;

    return PaginationModel.with(raws, {
      page: dto.page,
      perPage: dto.perPage,
      total
    })
  }

  async getAdminTag(id: number): Promise<SelectTag> {
    const tag = await DrizzleContext.db()
      .query.tags.findFirst({
        where: eq(tags.id, id)
      });
    if (!tag) {
      throw new BadRequestException('태그를 찾을 수 없습니다.');
    }
    return tag;
  }
}