import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { and, eq, ne } from 'drizzle-orm';

import { UpdatePublishDto } from 'src/app/_concern';
import { FileAttachmentService } from 'src/features/attach-file';
import { TagCreationService } from 'src/features/create-tag';
import { DRIZZLE, DrizzleOrm, DrizzleTransaction, posts, postTags, SelectPost, SelectTag, UserId } from 'src/shared/drizzle';
import { LoggerService } from 'src/shared/logger';
import { CreatePostDto, UpdatePostDto } from '../dto/create-or-update-post.dto';

@Injectable()
export class PostCommandService {
  constructor(
    @Inject(DRIZZLE)
    private readonly drizzle: DrizzleOrm,
    private readonly logger: LoggerService,
    private readonly tagCreationService: TagCreationService,
    private readonly fileAttachmentService: FileAttachmentService,

  ) { }

  // ---------------------------------------------------------------------------
  // 관리자 기능
  // ---------------------------------------------------------------------------

  async createPost(userId: UserId, dto: CreatePostDto) {
    await this.drizzle.transaction(async (tx) => {
      // 0. slug 중복 검증
      await this.validateSlugUniqueness(dto.slug, undefined);

      // 1. 게시물 생성
      const [createdPost] = await tx
        .insert(posts)
        .values({
          userId: userId,
          slug: dto.slug,
          title: dto.title,
          content: dto.content,
          summary: dto.summary,
          isPublishedYn: dto.isPublishedYn,
          publishedAt: dto.publishedAt.toISOString(),
          postType: dto.postType,
        })
        .returning();

      // 2. 태그 연결 (optional)
      if (dto.tags && dto.tags.length > 0) {
        const tags = await this.tagCreationService.create(dto.tags, tx);
        await this.attachTags(createdPost, tags, tx);
      }

      // 3. 썸네일 첨부 (optional)
      if (dto.thumbnailBlobId) {
        await this.fileAttachmentService.createThumbnailAttachment(
          dto.thumbnailBlobId,
          createdPost.id.toString(),
          'post',
          tx,
        );
      }

      // 4. 콘텐츠 이미지 첨부 (optional)
      await this.fileAttachmentService.createContentImageAttachments(
        dto.content,
        createdPost.id.toString(),
        'post',
        tx
      );

      return createdPost;
    });
  }

  async updatePost(postId: number, dto: UpdatePostDto) {
    return await this.drizzle.transaction(async (tx) => {
      // 1. 기존 게시물 조회 및 검증
      const existingPost = await this.drizzle.query.posts.findFirst({
        where: eq(posts.id, postId),
        with: {
          postTags: {
            with: {
              tag: true
            }
          }
        }
      })
      if (!existingPost) {
        throw new BadRequestException('게시물을 찾을 수 없습니다.');
      }

      // 1.5. slug 중복 검증 (slug가 변경된 경우에만)
      if (dto.slug && dto.slug !== existingPost.slug) {
        await this.validateSlugUniqueness(dto.slug, postId);
      }

      // 2. 게시물 기본정보 업데이트
      const [updatedPost] = await this.drizzle
        .update(posts)
        .set({
          ...existingPost,
          slug: dto.slug,
          title: dto.title,
          content: dto.content,
          summary: dto.summary,
          isPublishedYn: dto.isPublishedYn,
          publishedAt: dto.publishedAt.toISOString(),
          postType: dto.postType,
        })
        .where(eq(posts.id, existingPost.id))
        .returning();

      // 3. 태그 업데이트
      await this.updateTags(updatedPost, dto.tags, tx);

      // 4. 썸네일 업데이트 (optional)
      if (dto.thumbnailBlobId) {
        await this.fileAttachmentService.updateThumbnailAttachment(
          dto.thumbnailBlobId,
          updatedPost.id.toString(),
          'post',
          tx,
        );
      }

      // 5. 콘텐츠 이미지 업데이트
      await this.fileAttachmentService.updateContentImageAttachments(
        dto.content,
        updatedPost.id.toString(),
        'post',
        tx,
      );

      return updatedPost;
    });
  }

  async updatePublish(postId: number, dto: UpdatePublishDto) {

    const post = await this.drizzle.query.posts.findFirst({
      where: eq(posts.id, postId)
    });
    if (!post) {
      throw new BadRequestException('게시물을 찾을 수 없습니다.');
    }

    try {
      await this.drizzle
        .update(posts)
        .set({
          ...post,
          isPublishedYn: dto.isPublishedYn,
        })
        .where(eq(posts.id, postId))
        .returning();
    } catch (err) {
      this.logger.error(err.cause?.detail);
      throw new BadRequestException(err.cause?.detail);
    }
  }

  async destroyPost(postId: number) {
    await this.drizzle.transaction(async (tx) => {
      // 1. 기존 게시물 조회 및 검증
      const existingPost = await this.drizzle.query.posts.findFirst({
        where: eq(posts.id, postId)
      });
      if (!existingPost) {
        throw new BadRequestException('게시물을 찾을 수 없습니다.');
      }

      // 2. 관련된 모든 첨부 삭제
      await this.fileAttachmentService.deleteAllAttachments(postId.toString(), 'post', tx);

      // 3. 게시물 삭제
      await this.drizzle
        .delete(posts)
        .where(eq(posts.id, postId));
    });
  }

  // ---------------------------------------------------------------------------
  // PRIVATE
  // ---------------------------------------------------------------------------

  private async updateTags(post: SelectPost, newTagNames: string[] | undefined, tx: DrizzleTransaction) {
    if (newTagNames && newTagNames.length > 0) {
      // 새로운 태그들로 교체
      const tags = await this.tagCreationService.create(newTagNames, tx);
      await this.attachTags(post, tags, tx);
    } else {
      // 태그가 없는 경우 모든 태그 제거
      await this.attachTags(post, [], tx);
    }
  }

  private async validateSlugUniqueness(slug: string, excludePostId?: number): Promise<void> {
    const whereCondition = excludePostId
      ? and(eq(posts.slug, slug), ne(posts.id, excludePostId))
      : eq(posts.slug, slug);

    const existingPost = await this.drizzle.query.posts.findFirst({
      where: whereCondition
    });

    if (existingPost) {
      throw new BadRequestException(`슬러그 '${slug}'는 이미 사용 중입니다.`);
    }
  }

  private async attachTags(post: SelectPost, tags: SelectTag[], tx: DrizzleTransaction) {
    // 1. 기존 태그 관계 모두 삭제
    await tx.delete(postTags)
      .where(eq(postTags.postId, post.id));

    // 2. 새로운 태그 관계들 생성 (태그가 있는 경우에만)
    if (tags.length > 0) {
      const postTagValues = tags.map(tag => ({
        postId: post.id,
        tagId: tag.id
      }));

      await tx.insert(postTags)
        .values(postTagValues);
    }
  }

}
