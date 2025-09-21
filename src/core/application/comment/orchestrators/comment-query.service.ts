import { Inject, Injectable } from '@nestjs/common';
import { asc, count, desc, eq, getTableColumns, like, or } from 'drizzle-orm';

import { GetAdminCommentsDto } from 'src/core/infrastructure/dto';
import { comments, DRIZZLE, DrizzleOrm, posts } from 'src/shared/drizzle';

@Injectable()
export class CommentQueryService {
  constructor(
    @Inject(DRIZZLE)
    private readonly drizzle: DrizzleOrm
  ) { }

  // ---------------------------------------------------------------------------
  // 일반 조회
  // ---------------------------------------------------------------------------

  async getPostComments(postSlug: string) {
    return await this.drizzle
      .select(getTableColumns(comments))
      .from(comments)
      .leftJoin(posts, eq(posts.id, comments.postId))
      .where(eq(posts.slug, postSlug))
      .orderBy(comments.createdAt);
  }

  // ---------------------------------------------------------------------------
  // 관리자 조회
  // ---------------------------------------------------------------------------

  async getAdminComments(dto: GetAdminCommentsDto) {
    // 검색 조건 설정
    const whereCondition = dto.search
      ? or(
          like(comments.comment, `%${dto.search}%`),
          like(comments.nickname, `%${dto.search}%`)
        )
      : undefined;

    // 정렬 설정
    const orderCondition = dto.orderBy === 'ASC'
      ? asc(comments[dto.orderKey])
      : desc(comments[dto.orderKey]);

    // 페이지네이션 계산
    const offset = (dto.page - 1) * dto.perPage;

    // 메인 쿼리 (데이터)
    const commentsQuery = this.drizzle
      .select({
        ...getTableColumns(comments),
        post: {
          id: posts.id,
          title: posts.title,
          slug: posts.slug
        }
      })
      .from(comments)
      .leftJoin(posts, eq(posts.id, comments.postId))
      .where(whereCondition)
      .orderBy(orderCondition)
      .limit(dto.perPage)
      .offset(offset);

    // 총 개수 쿼리
    const countQuery = this.drizzle
      .select({ count: count() })
      .from(comments)
      .where(whereCondition);

    // 병렬 실행
    const [commentResults, totalResults] = await Promise.all([
      commentsQuery,
      countQuery
    ]);

    const total = totalResults[0].count;

    return {
      comments: commentResults,
      pagination: {
        page: dto.page,
        perPage: dto.perPage,
        total,
        totalPages: Math.ceil(total / dto.perPage),
      },
    };
  }
}