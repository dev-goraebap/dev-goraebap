import { BadRequestException, Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';

import { AttachmentSharedService, PostEntity, TagsSharedService, UpdatePublishDto, UserEntity } from 'src/shared';
import { CreatePostDto, UpdatePostDto } from './dto/create-or-update-post.dto';
import { GetPostsDTO } from './dto/get-posts.dto';
import { PostsService } from './posts.service';

@Injectable()
export class PostsApplicationService {
  constructor(
    private readonly entityManager: EntityManager,
    private readonly tagsSharedService: TagsSharedService,
    private readonly attachmentSharedService: AttachmentSharedService,
    private readonly postsService: PostsService,
  ) {}

  async getPosts(dto: GetPostsDTO) {
    return this.postsService.getPosts(dto);
  }

  async getPost(id: number) {
    return this.postsService.getPost(id);
  }

  async createPost(user: UserEntity, dto: CreatePostDto) {
    await this.entityManager.transaction(async (m: EntityManager) => {
      // 0. slug 중복 검증
      await this.postsService.validateSlugUniqueness(dto.slug, undefined);

      // 1. 게시물 생성
      const post = await this.postsService.createPost(user, dto, m);

      // 2. 태그 연결 (optional)
      if (dto.tags && dto.tags.length > 0) {
        const tags = await this.tagsSharedService.findOrCreateTags(dto.tags, m);
        await this.postsService.attachTags(post, tags, m);
      }

      // 3. 썸네일 첨부 (optional)
      if (dto.thumbnailBlobId) {
        await this.attachmentSharedService.createThumbnailAttachment(
          dto.thumbnailBlobId,
          post.id.toString(),
          'post',
          m,
        );
      }

      // 4. 콘텐츠 이미지 첨부 (optional)
      await this.attachmentSharedService.createContentImageAttachments(dto.content, post.id.toString(), 'post', m);

      return post;
    });
  }

  async updatePost(postId: number, dto: UpdatePostDto) {
    return await this.entityManager.transaction(async (m: EntityManager) => {
      // 1. 기존 게시물 조회 및 검증
      const existingPost = await this.postsService.findByIdWithRelations(postId, ['tags']);
      if (!existingPost) {
        throw new BadRequestException('게시물을 찾을 수 없습니다.');
      }

      // 1.5. slug 중복 검증 (slug가 변경된 경우에만)
      if (dto.slug && dto.slug !== existingPost.slug) {
        await this.postsService.validateSlugUniqueness(dto.slug, postId);
      }

      // 2. 게시물 기본 정보 업데이트
      const updatedPost = await this.postsService.updatePost(postId, dto, m);

      // 3. 태그 업데이트
      await this.updateTags(updatedPost, dto.tags, m);

      // 4. 썸네일 업데이트 (optional)
      if (dto.thumbnailBlobId) {
        await this.attachmentSharedService.updateThumbnailAttachment(
          dto.thumbnailBlobId,
          updatedPost.id.toString(),
          'post',
          m,
        );
      }

      // 5. 콘텐츠 이미지 업데이트
      await this.attachmentSharedService.updateContentImageAttachments(
        dto.content,
        updatedPost.id.toString(),
        'post',
        m,
      );

      return updatedPost;
    });
  }

  async updatePublish(postId: number, dto: UpdatePublishDto) {
    return this.postsService.updatePublish(postId, dto);
  }

  async destroyPost(postId: number) {
    await this.entityManager.transaction(async (m: EntityManager) => {
      // 1. 기존 게시물 조회 및 검증
      const existingPost = await this.postsService.findById(postId);
      if (!existingPost) {
        throw new BadRequestException('게시물을 찾을 수 없습니다.');
      }

      // 2. 관련된 모든 첨부 삭제
      await this.attachmentSharedService.deleteAllAttachments(postId.toString(), 'post', m);

      // 3. 게시물 삭제
      await this.postsService.destroyPost(existingPost, m);
    });
  }

  private async updateTags(post: PostEntity, newTagNames: string[] | undefined, manager: EntityManager) {
    if (newTagNames && newTagNames.length > 0) {
      // 새로운 태그들로 교체
      const tags = await this.tagsSharedService.findOrCreateTags(newTagNames, manager);
      await this.postsService.attachTags(post, tags, manager);
    } else {
      // 태그가 없는 경우 모든 태그 제거
      await this.postsService.attachTags(post, [], manager);
    }
  }
}
