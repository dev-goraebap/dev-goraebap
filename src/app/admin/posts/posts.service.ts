import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Not, Repository } from 'typeorm';

import { AttachmentQueryHelper, PostEntity, TagEntity, UserEntity } from 'src/shared';
import { CreatePostDto, UpdatePostDto } from './dto/create-or-update-post.dto';
import { GetPostsDTO } from './dto/get-posts.dto';
import { UpdatePostPublishDto } from './dto/update-publish.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,
  ) {}

  async findById(id: number) {
    return this.postRepository.findOne({ where: { id } });
  }

  async findByIdWithRelations(id: number, relations: string[]) {
    return this.postRepository.findOne({
      where: { id },
      relations: relations.reduce((acc, rel) => ({ ...acc, [rel]: true }), {}),
    });
  }

  async getPosts(dto: GetPostsDTO) {
    const qb = this.postRepository.createQueryBuilder('post').leftJoinAndSelect('post.tags', 'tag');
    AttachmentQueryHelper.withAttachments(qb, 'post');

    // 검색 조건 추가
    if (dto.search) {
      qb.where('post.title LIKE :title', {
        title: `%${dto.search}%`,
      });
    }

    // 정렬 추가
    qb.orderBy(`post.${dto.orderKey}`, dto.orderBy);

    return await qb.getMany();
  }

  async getPost(id: number) {
    const qb = this.postRepository.createQueryBuilder('post').leftJoinAndSelect('post.tags', 'tag');
    AttachmentQueryHelper.withAttachments(qb, 'post');
    qb.where('post.id = :id', { id });
    const post = await qb.getOne();

    if (!post) {
      throw new BadRequestException('게시물을 찾을 수 없습니다.');
    }
    return post;
  }

  async validateSlugUniqueness(slug: string, excludePostId?: number) {
    const whereCondition: any = { slug };

    // 업데이트의 경우 현재 포스트는 제외
    if (excludePostId) {
      whereCondition.id = Not(excludePostId);
    }

    const existingPost = await this.postRepository.exists({ where: whereCondition });

    if (existingPost) {
      throw new BadRequestException(`슬러그 '${slug}'는 이미 사용 중입니다.`);
    }
  }

  async createPost(user: UserEntity, dto: CreatePostDto, manager: EntityManager) {
    const newPost = this.postRepository.create({
      user,
      slug: dto.slug,
      title: dto.title,
      content: dto.content,
      summary: dto.summary,
      isPublished: dto.isPublished,
      publishedAt: dto.publishedAt,
      postType: dto.postType,
    });
    return await manager.save(newPost);
  }

  async updatePost(id: number, dto: UpdatePostDto, manager: EntityManager) {
    const repo = manager.getRepository(PostEntity);
    const post = await repo.findOne({ where: { id } });

    const updatedPost = repo.create({
      ...post,
      slug: dto.slug,
      title: dto.title,
      content: dto.content,
      summary: dto.summary,
      isPublished: dto.isPublished,
      publishedAt: dto.publishedAt,
      postType: dto.postType,
    });

    return await repo.save(updatedPost);
  }

  async attachTags(post: PostEntity, tags: TagEntity[], manager: EntityManager) {
    const attachTagsPost = this.postRepository.create({ ...post, tags });
    return await manager.save(attachTagsPost);
  }

  async updatePublish(id: number, dto: UpdatePostPublishDto) {
    const post = await this.postRepository.findOne({
      where: {
        id,
      },
    });
    if (!post) {
      throw new BadRequestException('게시물을 찾을 수 없습니다.');
    }
    const updatedPost = this.postRepository.create({
      ...post,
      isPublished: dto.isPublished,
      ...(dto.isPublished && { publishedAt: new Date() }),
    });
    await this.postRepository.save(updatedPost);
  }

  async destroyPost(post: PostEntity, manager: EntityManager) {
    return await manager.remove(post);
  }
}
