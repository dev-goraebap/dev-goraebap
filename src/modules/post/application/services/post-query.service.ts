import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AttachmentQueryHelper, PostEntity } from 'src/shared';
import { Repository } from 'typeorm';
import { GetPostsDTO } from '../dto/get-posts.dto';

@Injectable()
export class PostQueryService {
  constructor(
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,
  ) {}

  async getPosts(dto: GetPostsDTO) {
    const qb = this.postRepository.createQueryBuilder('post').leftJoinAndSelect('post.tags', 'tag');
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

  async getPost(id: number): Promise<PostEntity> {
    const qb = this.postRepository.createQueryBuilder('post').leftJoinAndSelect('post.tags', 'tag');
    AttachmentQueryHelper.withAttachments(qb, 'post');
    qb.where('post.id = :id', { id });
    const post = await qb.getOne();

    if (!post) {
      throw new NotFoundException('게시물을 찾을 수 없습니다.');
    }
    return post;
  }

  async getRandomSuggestedPosts(excludeSlug: string): Promise<PostEntity[]> {
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

  async getPublishedPostBySlug(slug: string): Promise<PostEntity> {
    const qb = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.tags', 'tag')
      .where("post.isPublishedYn = 'Y'")
      .andWhere('post.slug = :slug', { slug });
    AttachmentQueryHelper.withAttachments(qb, 'post');
    const result = await qb.getOne();
    
    if (!result) {
      throw new NotFoundException('게시물을 찾을 수 없습니다.');
    }
    return result;
  }
}