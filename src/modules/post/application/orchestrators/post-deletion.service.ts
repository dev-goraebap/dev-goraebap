import { BadRequestException, Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';

import { AttachmentSharedService } from 'src/shared';
import { PostService } from '../services/post.service';

@Injectable()
export class PostDeletionService {
  constructor(
    private readonly entityManager: EntityManager,
    private readonly postService: PostService,
    private readonly attachmentSharedService: AttachmentSharedService,
  ) {}

  async destroy(postId: number) {
    await this.entityManager.transaction(async (manager: EntityManager) => {
      // 1. 기존 게시물 조회 및 검증
      const existingPost = await this.postService.findById(postId);
      if (!existingPost) {
        throw new BadRequestException('게시물을 찾을 수 없습니다.');
      }

      // 2. 관련된 모든 첨부 삭제
      await this.attachmentSharedService.deleteAllAttachments(postId.toString(), 'post', manager);

      // 3. 게시물 삭제
      await this.postService.destroyPost(existingPost, manager);
    });
  }
}