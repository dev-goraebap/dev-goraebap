import { Injectable } from '@nestjs/common';
import { and, asc, count, desc, eq, getTableColumns, isNull, like, or } from 'drizzle-orm';

import { comments, DrizzleContext, posts, SelectComment } from 'src/shared/drizzle';
import { GetAdminCommentsDto } from '../dto/get-admin-comments.dto';
import { PaginationModel } from '../read-models';

@Injectable()
export class CommentQueryService {

  async getAdminCommentsWithPagination(dto: GetAdminCommentsDto): Promise<PaginationModel<SelectComment>> {
    // 검색 조건 설정
    const searchCondition = dto.search
      ? or(
        like(comments.comment, `%${dto.search}%`),
        like(comments.nickname, `%${dto.search}%`)
      )
      : undefined;

    const whereCondition = and(searchCondition, isNull(comments.deletedAt));

    // 정렬 설정
    const orderCondition = dto.orderBy === 'ASC'
      ? asc(comments[dto.orderKey])
      : desc(comments[dto.orderKey]);

    // 페이지네이션 계산
    const offset = (dto.page - 1) * dto.perPage;

    // 메인 쿼리 (데이터)
    const commentsQuery = DrizzleContext.db()
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
    const countQuery = DrizzleContext.db()
      .select({ count: count() })
      .from(comments)
      .where(whereCondition);

    // 병렬 실행
    const [raws, totalRaws] = await Promise.all([
      commentsQuery,
      countQuery
    ]);
    const total = totalRaws[0].count;

    return PaginationModel.with(raws, {
      page: dto.page,
      perPage: dto.perPage,
      total
    });
  }

  async getPostComments(postSlug: string): Promise<SelectComment[]> {
    return await DrizzleContext.db()
      .select(getTableColumns(comments))
      .from(comments)
      .leftJoin(posts, eq(posts.id, comments.postId))
      .where(and(eq(posts.slug, postSlug), isNull(comments.deletedAt)))
      .orderBy(comments.createdAt);
  }
}