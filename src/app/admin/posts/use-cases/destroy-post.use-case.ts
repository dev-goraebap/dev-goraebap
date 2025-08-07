import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { AttachmentEntity, PostEntity } from 'src/shared';

@Injectable()
export class DestroyPostUseCase {
  constructor(
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,
    @InjectRepository(AttachmentEntity)
    private readonly attachmentRepository: Repository<AttachmentEntity>,
    private readonly entityManager: EntityManager,
  ) {}

  async execute(id: number) {
    await this.entityManager.transaction(async () => {
      // 삭제할 게시물 조회
      const post = await this.postRepository.findOne({
        where: { id },
      });
      if (!post) {
        throw new BadRequestException('게시물을 찾을 수 없습니다.');
      }

      // 게시물에 관련된 모든 첨부 삭제
      const existsPostAttachments = await this.attachmentRepository.find({
        where: {
          recordType: 'post',
          recordId: post.id.toString(),
        },
      });
      if (existsPostAttachments.length !== 0) {
        await this.entityManager.remove(existsPostAttachments);
      }

      // 게시물 삭제
      await this.entityManager.remove(post);
    });
  }
}
