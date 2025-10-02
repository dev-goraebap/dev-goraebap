import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { UpdatePublishDto } from 'src/api/_concern';
import { AttachmentEntity } from 'src/domain/media/attachment.entity';
import { POST_REPO, PostRepository } from 'src/domain/post';
import { PostTagEntity } from 'src/domain/post/post-tag.entity';
import { TagEntity } from 'src/domain/tag';
import { DrizzleContext, UserId } from 'src/shared/drizzle';
import { LoggerService } from 'src/shared/logger';
import { CreatePostDto, UpdatePostDto } from './dto/create-or-update-post.dto';

@Injectable()
export class PostApplicationService {

  constructor(
    private readonly logger: LoggerService,
    @Inject(POST_REPO)
    private readonly postRepository: PostRepository
  ) { }

  // ---------------------------------------------------------------------------
  // 관리자 기능
  // ---------------------------------------------------------------------------

  async createPost(userId: UserId, dto: CreatePostDto) {
    return await DrizzleContext.transaction(async () => {
      // 1. slug 중복 검증
      await this.validateSlugUniqueness(dto.slug);

      // 2. 게시물 생성
      const post = await this.postRepository.create({
        userId,
        slug: dto.slug,
        title: dto.title,
        content: dto.content,
        summary: dto.summary,
        isPublishedYn: dto.isPublishedYn,
        publishedAt: dto.publishedAt,
        postType: dto.postType,
      });

      // 3. 태그 연결
      if (dto.tags && dto.tags.length > 0) {
        const tags = await TagEntity.findOrCreate(userId, dto.tags);
        await PostTagEntity.link(post.id, tags.map(t => t.id));
      }

      // 4. 썸네일 첨부
      if (dto.thumbnailBlobId) {
        await AttachmentEntity.createThumbnail(
          dto.thumbnailBlobId,
          post.id.toString(),
          'post'
        );
      }

      // 5. 콘텐츠 이미지 첨부
      await AttachmentEntity.createContentImages(
        dto.content,
        post.id.toString(),
        'post'
      );

      return post;
    })
  }

  async updatePost(postId: number, dto: UpdatePostDto) {
    return await DrizzleContext.transaction(async () => {
      // 1. 기존 게시물 조회
      const existingPost = await this.postRepository.findById(postId);
      if (!existingPost) {
        throw new BadRequestException('게시물을 찾을 수 없습니다.');
      }

      // 2. slug 중복 검증
      if (dto.slug && dto.slug !== existingPost.slug) {
        await this.validateSlugUniqueness(dto.slug, postId);
      }

      // 3. 게시물 업데이트
      const updatedPost = await this.postRepository.update(postId, {
        slug: dto.slug,
        title: dto.title,
        content: dto.content,
        summary: dto.summary,
        isPublishedYn: dto.isPublishedYn,
        publishedAt: dto.publishedAt,
        postType: dto.postType,
      });

      // 4. 태그 업데이트
      if (dto.tags !== undefined) {
        const tags = dto.tags.length > 0
          ? await TagEntity.findOrCreate(existingPost.userId, dto.tags)
          : [];
        await PostTagEntity.link(postId, tags.map(t => t.id));
      }

      // 5. 썸네일 업데이트
      if (dto.thumbnailBlobId) {
        await AttachmentEntity.updateThumbnail(
          dto.thumbnailBlobId,
          postId.toString(),
          'post'
        );
      }

      // 6. 콘텐츠 이미지 업데이트
      if (dto.content) {
        await AttachmentEntity.updateContentImages(
          dto.content,
          postId.toString(),
          'post'
        );
      }

      return updatedPost;
    });
  }

  async updatePublish(postId: number, dto: UpdatePublishDto) {
    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new BadRequestException('게시물을 찾을 수 없습니다.');
    }

    try {
      return await this.postRepository.update(postId, { isPublishedYn: dto.isPublishedYn });
    } catch (err) {
      this.logger.error(err.cause?.detail);
      throw err;
    }
  }

  async destroyPost(postId: number) {
    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new BadRequestException('게시물을 찾을 수 없습니다.');
    }

    // 1. 관련된 모든 첨부 삭제
    await AttachmentEntity.deleteAll(postId.toString(), 'post');

    // 2. 게시물 삭제
    await this.postRepository.delete(postId);
  }

  // ---------------------------------------------------------------------------
  // PRIVATE
  // ---------------------------------------------------------------------------

  private async validateSlugUniqueness(slug: string, excludePostId?: number): Promise<void> {
    const exists = await this.postRepository.checkSlugExists(slug, excludePostId);
    if (exists) {
      throw new BadRequestException(`슬러그 '${slug}'는 이미 사용 중입니다.`);
    }
  }
}
