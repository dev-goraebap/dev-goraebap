import { Inject } from "@nestjs/common";
import { and, asc, count, desc, eq, getTableColumns, like, sql, SQL } from "drizzle-orm";

import { PaginationModel, ThumbnailModel } from "src/app/_concern";
import { GetAdminPostsDto, IPostTableGateway, PostEntity } from "src/app/post";
import { CloudflareR2Service } from "src/shared/cloudflare-r2";
import { DRIZZLE, DrizzleOrm, getThumbnailSubquery, posts } from "src/shared/drizzle";
import { PostMapper } from "../mappers/post.mapper";

export class PostTableGateway implements IPostTableGateway {

  constructor(
    @Inject(DRIZZLE)
    private readonly drizzle: DrizzleOrm,
    private readonly r2Service: CloudflareR2Service
  ) { }

  async findAdminPostsWithPagination(dto: GetAdminPostsDto): Promise<PaginationModel<PostEntity>> {
    // 동적 조건 처리
    const whereConditions: SQL[] = [];
    if (dto.search) {
      whereConditions.push(like(posts.title, `%${dto.search}%`));
    }
    if (dto.postType) {
      whereConditions.push(eq(posts.postType, dto.postType));
    }
    if (dto.isPublishedYn) {
      whereConditions.push(eq(posts.isPublishedYn, dto.isPublishedYn));
    }
    const whereCondition = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    // 정렬 설정
    const orderCondition = dto.orderBy === 'ASC'
      ? asc(posts[dto.orderKey])
      : desc(posts[dto.orderKey]);

    // 썸네일 공용 서브쿼리
    const thumbnailSubquery = getThumbnailSubquery(this.drizzle);

    // 데이터 쿼리
    const dataQuery = this.drizzle
      .select({
        ...getTableColumns(posts),
        ...thumbnailSubquery.columns
      })
      .from(posts)
      .leftJoin(thumbnailSubquery.qb, and(
        eq(thumbnailSubquery.qb.recordType, 'series'),
        eq(thumbnailSubquery.qb.recordId, sql`CAST(${posts.id} AS TEXT)`),
      ))
      .where(whereCondition)
      .orderBy(orderCondition)
      .limit(dto.perPage)
      .offset((dto.page - 1) * dto.perPage);

    // 전체 페이지 쿼리
    const countQuery = this.drizzle.select({ count: count() })
      .from(posts)
      .where(whereCondition);

    // 병렬 처리
    const [data, countResult] = await Promise.all([
      dataQuery,
      countQuery
    ]);

    // 뷰모델로 변경
    const items = data.map(x => {
      const { file, ...rawPost } = x;
      if (file) {
        const url = this.r2Service.getPublicUrl(file.key);
        const thumbnail = ThumbnailModel.from(url, file.metadata);
        return PostMapper.toEntity(rawPost, thumbnail);
      }
      return PostMapper.toEntity(rawPost);
    });

    // 페이지네이션으로 감싸기
    return PaginationModel.with(items, {
      page: dto.page,
      perPage: dto.perPage,
      total: countResult[0].count
    });
  }
}