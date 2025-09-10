import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';

import { AttachmentSharedService, TagsSharedService, UserEntity } from 'src/shared';
import { CreatePostDto } from '../dto/create-or-update-post.dto';
import { PostService } from '../services/post.service';

@Injectable()
export class PostCreationService {
  constructor(
    private readonly entityManager: EntityManager,
    private readonly postService: PostService,
    private readonly tagsSharedService: TagsSharedService,
    private readonly attachmentSharedService: AttachmentSharedService,
  ) {}

  async create(user: UserEntity, dto: CreatePostDto) {
    return await this.entityManager.transaction(async (manager: EntityManager) => {
      // 1. slug 중복 검증
      await this.postService.validateSlugUniqueness(dto.slug, undefined);

      // 2. 게시물 생성
      const post = await this.postService.createPost(user, dto, manager);

      // 3. 태그 연결 (optional)
      if (dto.tags && dto.tags.length > 0) {
        const tags = await this.tagsSharedService.findOrCreateTags(dto.tags, manager);
        await this.postService.attachTags(post, tags, manager);
      }

      // 4. 썸네일 첨부 (optional)
      if (dto.thumbnailBlobId) {
        await this.attachmentSharedService.createThumbnailAttachment(
          dto.thumbnailBlobId,
          post.id.toString(),
          'post',
          manager,
        );
      }

      // 5. 콘텐츠 이미지 첨부 (optional)
      await this.attachmentSharedService.createContentImageAttachments(dto.content, post.id.toString(), 'post', manager);

      return post;
    });
  }
}