import { BadRequestException, Injectable } from '@nestjs/common';
import { AttachmentEntity, BlobEntity, PostEntity } from 'src/shared';
import { EntityManager, In } from 'typeorm';
import { UpdatePostDto } from '../dto/update-post.dto';

@Injectable()
export class UpdatePostUseCase {
  constructor(private readonly entityManager: EntityManager) {}

  async execute(id: number, dto: UpdatePostDto) {
    await this.entityManager.transaction(async () => {
      // 게시물 변경
      const post = await PostEntity.findOne({
        where: { id },
      });
      if (!post) {
        throw new BadRequestException('게시물을 찾을 수 없습니다.');
      }
      const updatedPost = PostEntity.create({
        ...post,
        title: dto.title,
        content: dto.content,
      });
      await updatedPost.save();

      // 썸네일이 변경된 경우
      if (dto.thumbnailBlobId) {
        const existsThumbnailAttachments = await AttachmentEntity.find({
          where: {
            name: 'thumbnail',
            recordType: 'post',
            recordId: updatedPost.id.toString(),
          },
        });
        if (existsThumbnailAttachments.length !== 0) {
          await AttachmentEntity.remove(existsThumbnailAttachments);
        }

        const thumbnailBlob = await BlobEntity.findOne({
          where: {
            id: dto.thumbnailBlobId,
          },
        });

        if (!thumbnailBlob) {
          throw new BadRequestException('썸네일 파일이 존재하지 않습니다.');
        }
        const newThumbnailAttachment = AttachmentEntity.create({
          blob: thumbnailBlob,
          name: 'thumbnail',
          recordType: 'post',
          recordId: updatedPost.id.toString(),
        });
        await newThumbnailAttachment.save();
      }

      // 게시물 컨텐츠 이미지가 있을 경우 컨텐츠 이미지 첨부 생성
      if (dto.contentBlobIds.length !== 0) {
        const blobs = await BlobEntity.find({
          where: {
            id: In(dto.contentBlobIds),
          },
        });
        const newAttachments = blobs.map((x) => {
          return AttachmentEntity.create({
            blob: x,
            name: 'contentImage',
            recordType: 'post',
            recordId: updatedPost.id.toString(),
          });
        });
        await AttachmentEntity.save(newAttachments);
      }
    });
  }
}
