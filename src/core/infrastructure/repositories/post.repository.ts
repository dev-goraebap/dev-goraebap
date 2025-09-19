import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { PostEntity } from 'src/core/infrastructure/entities';
import { AttachmentQueryHelper } from 'src/shared';
import { GetAdminPostsDTO, GetFeedPostsDto } from '../dto';
import { CloudflareR2Service } from '../services';
import { PostCardModel, ThumbnailModel } from '../view-models';

@Injectable()
export class PostRepository {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,
    private readonly r2Service: CloudflareR2Service

  ) { }

  // ---------------------------------------------------------------------------
  // 일반 조회
  // ---------------------------------------------------------------------------

  async findTest() {
    const sqlStatement = `
    SELECT
    p.id,
      p.title,
      p.summary,
      p.view_count,
      p.published_at,
      f.key,
      f.metadata,
      COALESCE(c.comment_count, 0) as comment_count,
      COALESCE(t.tags, null) as tags
    FROM posts p
    -- 썸네일 정보 조인
    LEFT JOIN (
      SELECT DISTINCT ON (a.record_type, a.record_id, a.name)
    a.record_type,
      a.record_id,
      a.name,
      b.metadata,
      b.key
    FROM blobs b
    LEFT JOIN attachments a ON a.blob_id = b.id
    WHERE a.name = 'thumbnail'
    ORDER BY a.record_type, a.record_id, a.name, b.created_at DESC
  ) f ON f.record_type = 'post' AND f.record_id = CAST(p.id AS TEXT)
    -- 코맨트 정보 조인
    LEFT JOIN (
      SELECT
    post_id,
    COUNT(*) AS comment_count
    FROM comments
    group by post_id
  ) c ON c.post_id = p.id
    -- 태그 정보 조인
    LEFT JOIN (
      SELECT
    pt.post_id,
      JSON_AGG(
        json_build_object(
          'id', t.id,
          'name', t.name
        )
      ) as tags
    FROM post_tags pt
    INNER JOIN tags t ON t.id = pt.tag_id
    GROUP BY pt.post_id
  ) t ON t.post_id = p.id
    WHERE
    -- 기본 조회 옵션
    p.post_type = 'post'
    AND p.is_published_yn = 'Y'
    --  cursor 기반 페이징 처리 (인기순)
    -- AND p.view_count < CAST('423' AS NUMERIC)
    -- AND p.published_at < CAST('2025-08-23T02:31:00.000Z' AS TIMESTAMP)
    -- cursor 기반 페이징 처리 (인기순)
    -- AND p.published_at < CAST('2025-08-23T02:31:00.000Z' AS TIMESTAMP)
    ORDER BY
    -- cursor 기반 정렬 (인기순)
    -- p.view_count DESC, p.published_at DESC
    -- cursor 기반 정렬 (최신순)
    p.published_at DESC
    LIMIT 5;
    `;
    const results: any[] = await this.dataSource.query(sqlStatement);

    const postModels = results.map(x => {
      if (x.key) {
        const url = this.r2Service.getPublicUrl(x.key);
        const thumbnailModel = ThumbnailModel.from(url, x.metadata);
        return PostCardModel.fromRaw(x, thumbnailModel);
      }
      return PostCardModel.fromRaw(x);
    });
    postModels.forEach(x => console.log(x));
  }

  async findFeedPosts(dto: GetFeedPostsDto) {
    const qb = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.tags', 'tag')
      .leftJoinAndSelect('post.comments', 'comment')
      .where('post.isPublishedYn = :isPublishedYn', { isPublishedYn: 'Y' })
      .andWhere('post.postType = :postType', { postType: 'post' });

    AttachmentQueryHelper.withAttachments(qb, 'post');

    if (dto.cursor) {
      const [publishedAt, viewCount] = dto.cursor.split('_');

      if (dto.orderType === 'traffic') {
        qb.andWhere(
          '(post.viewCount < :viewCount OR (post.viewCount = :viewCount AND post.publishedAt < :publishedAt))',
          { viewCount: parseInt(viewCount), publishedAt },
        );
      } else {
        qb.andWhere('post.publishedAt < :publishedAt', { publishedAt });
      }
    }

    if (dto.tag) {
      qb.andWhere('tag.name = :tag', { tag: dto.tag });
    }

    if (dto.orderType === 'traffic') {
      qb.orderBy('post.viewCount', 'DESC').addOrderBy('post.publishedAt', 'DESC');
    } else {
      qb.orderBy('post.publishedAt', 'DESC');
    }

    qb.take(dto.perPage + 1);

    const posts = await qb.getMany();
    const hasMore = posts.length > dto.perPage;
    const items = hasMore ? posts.slice(0, dto.perPage) : posts;

    let nextCursor: string | null = null;
    if (hasMore) {
      const lastItem = items[items.length - 1];
      if (dto.orderType === 'traffic') {
        nextCursor = `${lastItem.publishedAt.toISOString()}_${lastItem.viewCount}`;
      } else {
        nextCursor = lastItem.publishedAt.toISOString();
      }
    }

    return {
      items,
      nextCursor,
      hasMore,
    };
  }

  async findLatestPatchNote() {
    const qb = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.tags', 'tag')
      .where('post.isPublishedYn = :isPublishedYn', { isPublishedYn: 'Y' })
      .andWhere('post.postType = :postType', { postType: 'patch-note' });

    AttachmentQueryHelper.withAttachments(qb, 'post');
    qb.orderBy('post.publishedAt', 'DESC');
    qb.take(1);

    return await qb.getOne();
  }

  async findRandomSuggestedPosts(excludeSlug: string) {
    const posts = await this.postRepository
      .createQueryBuilder('post')
      .where("post.isPublishedYn = 'Y'")
      .andWhere('post.slug != :slug', { slug: excludeSlug })
      .andWhere('post.postType = :postType', { postType: 'post' })
      .getMany();

    const shuffled = posts.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 3);

    const qb = this.postRepository.createQueryBuilder('post');
    qb.leftJoinAndSelect('post.tags', 'tag');
    AttachmentQueryHelper.withAttachments(qb, 'post');
    qb.whereInIds(selected.map((p) => p.id));

    return await qb.getMany();
  }

  async findPublishedPostBySlug(slug: string) {
    const qb = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.tags', 'tag')
      .where("post.isPublishedYn = 'Y'")
      .andWhere('post.slug = :slug', { slug });
    AttachmentQueryHelper.withAttachments(qb, 'post');
    return await qb.getOne();
  }

  // ---------------------------------------------------------------------------
  // 관리자 조회
  // ---------------------------------------------------------------------------

  async findAdminPosts(dto: GetAdminPostsDTO) {
    const qb = this.postRepository.createQueryBuilder('post');
    qb.leftJoinAndSelect('post.tags', 'tag');
    AttachmentQueryHelper.withAttachments(qb, 'post');

    // 검색 조건 추가
    if (dto.search) {
      qb.where('post.title LIKE :title', {
        title: `%${dto.search}%`,
      });
    }

    // 게시물 타입 필터링
    if (dto.postType) {
      qb.andWhere('post.postType = :postType', {
        postType: dto.postType,
      });
    }

    // 발행 상태 필터링
    if (dto.isPublishedYn) {
      qb.andWhere('post.isPublishedYn = :isPublishedYn', {
        isPublishedYn: dto.isPublishedYn,
      });
    }

    // 정렬 추가
    qb.orderBy(`post.${dto.orderKey}`, dto.orderBy);

    // 페이지네이션 추가
    const offset = (dto.page - 1) * dto.perPage;
    qb.skip(offset).take(dto.perPage);

    // 결과 반환 (총 개수와 함께)
    const [posts, total] = await qb.getManyAndCount();

    return {
      posts,
      pagination: {
        page: dto.page,
        perPage: dto.perPage,
        total,
        totalPages: Math.ceil(total / dto.perPage),
      },
    };
  }

  async findAdminPost(id: number) {
    const qb = this.postRepository.createQueryBuilder('post').leftJoinAndSelect('post.tags', 'tag');
    AttachmentQueryHelper.withAttachments(qb, 'post');
    qb.where('post.id = :id', { id });
    return await qb.getOne();
  }

  async findAdminPostsExcludeSeriesId(seriesId: number, postTitle: string = '') {
    console.log(postTitle);
    // 특정 시리즈에 속하지 않은 모든 포스트(다른 시리즈에 속한 포스트 + 어떤 시리즈에도 속하지 않은 포스트)를 반환
    const qb = this.postRepository.createQueryBuilder('post');
    qb.where(
      `NOT EXISTS (
      SELECT 1 FROM series_posts sp 
      WHERE sp.post_id = post.id 
      AND sp.series_id = :seriesId
    )`,
      { seriesId },
    );

    if (postTitle) {
      qb.andWhere('post.title LIKE :postTitle', {
        postTitle: `%${postTitle}%`,
      });
    }

    qb.orderBy('post.createdAt', 'DESC');
    qb.take(5);

    return await qb.getMany();
  }
}