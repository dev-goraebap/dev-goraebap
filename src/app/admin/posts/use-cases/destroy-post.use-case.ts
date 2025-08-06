import { BadRequestException, Injectable } from '@nestjs/common';
import { AttachmentEntity, PostEntity } from 'src/shared';
import { EntityManager } from 'typeorm';

@Injectable()
export class DestroyPostUseCase {
  constructor(private readonly entityManager: EntityManager) {}

  async execute(id: number) {
    await this.entityManager.transaction(async () => {
      // 삭제할 게시물 조회
      const post = await PostEntity.findOne({
        where: { id },
      });
      if (!post) {
        throw new BadRequestException('게시물을 찾을 수 없습니다.');
      }

      // 게시물에 관련된 모든 첨부 삭제
      const existsPostAttachments = await AttachmentEntity.find({
        where: {
          recordType: 'post',
          recordId: post.id.toString(),
        },
      });
      if (existsPostAttachments.length !== 0) {
        await AttachmentEntity.remove(existsPostAttachments);
      }

      // 게시물 삭제
      await post.remove();
    });
  }
}
