import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';

import { AttachmentEntity, BlobEntity, PostEntity } from 'src/shared';
import { CreatePostDto } from '../dto/create-post.dto';
import {
  extractBlobIds,
  extractFirstParagraph,
} from '../utils/extract-content';

@Injectable()
export class CreatePostUseCase {
  constructor(
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,
    @InjectRepository(BlobEntity)
    private readonly blobRepository: Repository<BlobEntity>,
    @InjectRepository(AttachmentEntity)
    private readonly attachmentRepository: Repository<AttachmentEntity>,
    private readonly entityManager: EntityManager,
  ) {}

  async execute(dto: CreatePostDto) {
    await this.entityManager.transaction(async () => {
      // 요약 텍스트 추출
      const summary = extractFirstParagraph(dto.content);

      // 게시물 생성
      let newPost = this.postRepository.create({
        title: dto.title,
        content: dto.content,
        contentHtml: dto.contentHtml,
        summary,
        isPublished: false,
        publishedAt: new Date(),
      });
      newPost = await this.entityManager.save(newPost);

      // 썸네일 첨부 생성
      const thumbnailBlob = await this.blobRepository.findOne({
        where: {
          id: dto.thumbnailBlobId,
        },
      });
      if (!thumbnailBlob) {
        throw new BadRequestException('썸네일 파일이 존재하지 않습니다.');
      }
      const newThumbnailAttachment = this.attachmentRepository.create({
        blob: thumbnailBlob,
        name: 'thumbnail',
        recordType: 'post',
        recordId: newPost.id.toString(),
      });
      await this.entityManager.save(newThumbnailAttachment);

      const contentBlobIds = extractBlobIds(dto.content);

      // 게시물 컨텐츠 이미지가 있을 경우 컨텐츠 이미지 첨부 생성
      if (contentBlobIds.length !== 0) {
        const blobs = await this.blobRepository.find({
          where: {
            id: In(contentBlobIds),
          },
        });
        const newAttachments = blobs.map((x) => {
          return this.attachmentRepository.create({
            blob: x,
            name: 'contentImage',
            recordType: 'post',
            recordId: newPost.id.toString(),
          });
        });
        await this.entityManager.save(newAttachments);
      }
    });
  }
}
