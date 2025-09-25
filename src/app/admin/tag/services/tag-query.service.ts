import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { asc, count, desc, eq, like } from 'drizzle-orm';

import { DRIZZLE, DrizzleOrm, posts, postTags, tags } from 'src/shared/drizzle';
import { GetAdminTagsDto } from '../dto/get-admin-tags.dto';

@Injectable()
export class TagQueryService {
  constructor(
    @Inject(DRIZZLE)
    private readonly drizzle: DrizzleOrm
  ) { }

  // ---------------------------------------------------------------------------
  // 일반 조회
  // ---------------------------------------------------------------------------

  async getFeedTags() {
    return await this.drizzle
      .select({
        name: tags.name,
        postCount: count(posts)
      })
      .from(tags)
      .leftJoin(postTags, eq(postTags.tagId, tags.id))
      .leftJoin(posts, eq(posts.id, postTags.postId))
      .groupBy(tags.name)
      .orderBy(tags.name);
  }

  // ---------------------------------------------------------------------------
  // 관리자 조회
  // ---------------------------------------------------------------------------

  async getAdminTags(dto: GetAdminTagsDto) {
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
    const tagsQuery = this.drizzle
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
    const countQuery = this.drizzle
      .select({ count: count() })
      .from(tags)
      .where(whereCondition);

    // 병렬 실행
    const [tagResults, totalResults] = await Promise.all([
      tagsQuery,
      countQuery
    ]);

    const total = totalResults[0].count;

    return {
      tags: tagResults,
      pagination: {
        page: dto.page,
        perPage: dto.perPage,
        total,
        totalPages: Math.ceil(total / dto.perPage),
      },
    };
  }

  async getAdminTag(id: number) {
    const tag = await this.drizzle.query.tags.findFirst({
      where: eq(tags.id, id)
    })
    if (!tag) {
      throw new BadRequestException('태그를 찾을 수 없습니다.');
    }
    return tag;
  }
}