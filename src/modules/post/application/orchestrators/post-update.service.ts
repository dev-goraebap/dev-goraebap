import { BadRequestException, Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';

import { AttachmentSharedService, TagsSharedService, PostEntity, UpdatePublishDto } from 'src/shared';
import { UpdatePostDto } from '../dto/create-or-update-post.dto';
import { PostService } from '../services/post.service';

@Injectable()
export class PostUpdateService {
  constructor(
    private readonly entityManager: EntityManager,
    private readonly postService: PostService,
    private readonly tagsSharedService: TagsSharedService,
    private readonly attachmentSharedService: AttachmentSharedService,
  ) {}

  async update(postId: number, dto: UpdatePostDto) {
    return await this.entityManager.transaction(async (manager: EntityManager) => {
      // 1. 기존 게시물 조회 및 검증
      const existingPost = await this.postService.findByIdWithRelations(postId, ['tags']);
      if (!existingPost) {
        throw new BadRequestException('게시물을 찾을 수 없습니다.');
      }

      // 2. slug 중복 검증 (slug가 변경된 경우에만)
      if (dto.slug && dto.slug !== existingPost.slug) {
        await this.postService.validateSlugUniqueness(dto.slug, postId);
      }

      // 3. 게시물 기본 정보 업데이트
      const updatedPost = await this.postService.updatePost(postId, dto, manager);

      // 4. 태그 업데이트
      await this.updateTags(updatedPost, dto.tags, manager);

      // 5. 썸네일 업데이트 (optional)
      if (dto.thumbnailBlobId) {
        await this.attachmentSharedService.updateThumbnailAttachment(
          dto.thumbnailBlobId,
          updatedPost.id.toString(),
          'post',
          manager,
        );
      }

      // 6. 콘텐츠 이미지 업데이트
      await this.attachmentSharedService.updateContentImageAttachments(
        dto.content,
        updatedPost.id.toString(),
        'post',
        manager,
      );

      return updatedPost;
    });
  }

  async updatePublish(postId: number, dto: UpdatePublishDto) {
    return this.postService.updatePublish(postId, dto);
  }

  private async updateTags(post: PostEntity, newTagNames: string[] | undefined, manager: EntityManager) {
    if (newTagNames && newTagNames.length > 0) {
      // 새로운 태그들로 교체
      const tags = await this.tagsSharedService.findOrCreateTags(newTagNames, manager);
      await this.postService.attachTags(post, tags, manager);
    } else {
      // 태그가 없는 경우 모든 태그 제거
      await this.postService.attachTags(post, [], manager);
    }
  }
}