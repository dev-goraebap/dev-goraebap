import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PostEntity, TagEntity } from 'src/core/infrastructure/entities';
import { AttachmentQueryHelper } from 'src/shared';
import { GetAdminPostsDTO, GetFeedPostsDto } from '../dto';

@Injectable()
export class PostRepository {
  constructor(
    @InjectRepository(TagEntity)
    private readonly tagRepository: Repository<TagEntity>,
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,
  ) { }

  // ---------------------------------------------------------------------------
  // 일반 조회
  // ---------------------------------------------------------------------------

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
}