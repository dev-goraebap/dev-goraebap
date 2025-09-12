import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Not, Repository } from 'typeorm';

import { PostEntity, TagEntity, UserEntity } from 'src/core/infrastructure/entities';
import { UpdatePublishDto } from 'src/shared';
import { CreatePostDto, UpdatePostDto } from '../dto/create-or-update-post.dto';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,
  ) {}

  async findById(id: number): Promise<PostEntity | null> {
    return this.postRepository.findOne({ where: { id } });
  }

  async findByIdWithRelations(id: number, relations: string[]): Promise<PostEntity | null> {
    return this.postRepository.findOne({
      where: { id },
      relations: relations.reduce((acc, rel) => ({ ...acc, [rel]: true }), {}),
    });
  }

  async validateSlugUniqueness(slug: string, excludePostId?: number): Promise<void> {
    const whereCondition: any = { slug };

    if (excludePostId) {
      whereCondition.id = Not(excludePostId);
    }

    const existingPost = await this.postRepository.exists({ where: whereCondition });

    if (existingPost) {
      throw new BadRequestException(`슬러그 '${slug}'는 이미 사용 중입니다.`);
    }
  }

  async createPost(user: UserEntity, dto: CreatePostDto, manager: EntityManager): Promise<PostEntity> {
    const newPost = this.postRepository.create({
      user,
      slug: dto.slug,
      title: dto.title,
      content: dto.content,
      summary: dto.summary,
      isPublishedYn: dto.isPublishedYn,
      publishedAt: dto.publishedAt,
      postType: dto.postType,
    });
    return await manager.save(newPost);
  }

  async updatePost(id: number, dto: UpdatePostDto, manager: EntityManager): Promise<PostEntity> {
    const repo = manager.getRepository(PostEntity);
    const post = await repo.findOne({ where: { id } });

    const updatedPost = repo.create({
      ...post,
      slug: dto.slug,
      title: dto.title,
      content: dto.content,
      summary: dto.summary,
      isPublishedYn: dto.isPublishedYn,
      publishedAt: dto.publishedAt,
      postType: dto.postType,
    });

    return await repo.save(updatedPost);
  }

  async attachTags(post: PostEntity, tags: TagEntity[], manager: EntityManager): Promise<PostEntity> {
    const attachTagsPost = this.postRepository.create({ ...post, tags });
    return await manager.save(attachTagsPost);
  }

  async updatePublish(id: number, dto: UpdatePublishDto): Promise<void> {
    const post = await this.postRepository.findOne({
      where: { id },
    });
    
    if (!post) {
      throw new BadRequestException('게시물을 찾을 수 없습니다.');
    }

    const updatedPost = this.postRepository.create({
      ...post,
      isPublishedYn: dto.isPublishedYn,
    });
    await this.postRepository.save(updatedPost);
  }

  async destroyPost(post: PostEntity, manager: EntityManager): Promise<PostEntity> {
    return await manager.remove(post);
  }
}