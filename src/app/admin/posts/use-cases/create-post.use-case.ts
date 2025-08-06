import { BadRequestException, Injectable } from '@nestjs/common';
import { EntityManager, In } from 'typeorm';

import { AttachmentEntity, BlobEntity, PostEntity } from 'src/shared';
import { CreatePostDto } from '../dto/create-post.dto';

@Injectable()
export class CreatePostUseCase {
  constructor(private readonly entityManager: EntityManager) {}

  async execute(dto: CreatePostDto) {
    await this.entityManager.transaction(async () => {
      // 게시물 생성
      let newPost = PostEntity.create({
        title: dto.title,
        content: dto.content,
        isPublished: false,
        publishedAt: new Date(),
      });
      newPost = await newPost.save();

      // 썸네일 첨부 생성
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
        recordId: newPost.id.toString(),
      });
      await newThumbnailAttachment.save();

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
            recordId: newPost.id.toString(),
          });
        });
        await AttachmentEntity.save(newAttachments);
      }
    });
  }
}
