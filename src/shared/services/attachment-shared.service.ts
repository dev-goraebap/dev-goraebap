import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';

import { AttachmentEntity, BlobEntity } from '../entities';
import { extractImageUrls } from '../utils';

@Injectable()
export class AttachmentSharedService {
  constructor(
    @InjectRepository(AttachmentEntity)
    private attachmentRepository: Repository<AttachmentEntity>,
    @InjectRepository(BlobEntity)
    private blobRepository: Repository<BlobEntity>,
  ) {}

  async createThumbnailAttachment(
    blobId: number,
    recordId: string,
    recordType: string,
    manager: EntityManager,
  ): Promise<AttachmentEntity> {
    const blob = await this.blobRepository.findOne({ where: { id: blobId } });
    if (!blob) {
      throw new BadRequestException('썸네일 파일이 존재하지 않습니다.');
    }

    const attachment = this.attachmentRepository.create({
      blob,
      name: 'thumbnail',
      recordType,
      recordId,
    });

    return await manager.save(attachment);
  }

  async createContentImageAttachments(content: string, recordId: string, recordType: string, manager: EntityManager) {
    const imageUrls = extractImageUrls(content);

    if (imageUrls.length === 0) return [];

    const blobKeys = imageUrls.map((url) => url.match(/([a-f0-9]{32})$/)?.[1]).filter(Boolean);

    if (blobKeys.length === 0) return [];

    const blobs = await this.blobRepository.find({ where: { key: In(blobKeys) } });

    const attachments = blobs.map((blob) =>
      this.attachmentRepository.create({
        blob,
        name: 'contentImage',
        recordType,
        recordId,
      }),
    );

    return await manager.save(attachments);
  }

  async updateThumbnailAttachment(blobId: number, recordId: string, recordType: string, manager: EntityManager) {
    // 1. 기존 썸네일 제거
    await this.deleteThumbnailAttachments(recordId, recordType, manager);

    // 2. 새 썸네일 생성
    await this.createThumbnailAttachment(blobId, recordId, recordType, manager);
  }

  async updateContentImageAttachments(content: string, recordId: string, recordType: string, manager: EntityManager) {
    // 1. 기존 콘텐츠 이미지 모두 제거
    await this.deleteContentImageAttachments(recordId, recordType, manager);

    // 2. 새 콘텐츠 이미지 생성
    await this.createContentImageAttachments(content, recordId, recordType, manager);
  }

  async deleteAllAttachments(recordId: string, recordType: string, manager: EntityManager) {
    const attachmentRepo = manager.getRepository(AttachmentEntity);

    const attachments = await attachmentRepo.find({
      where: {
        recordType,
        recordId,
      },
    });

    if (attachments.length > 0) {
      await attachmentRepo.remove(attachments);
    }
  }

  async deleteThumbnailAttachments(recordId: string, recordType: string, manager: EntityManager) {
    const attachmentRepo = manager.getRepository(AttachmentEntity);

    const thumbnails = await attachmentRepo.find({
      where: {
        name: 'thumbnail',
        recordType,
        recordId,
      },
    });

    if (thumbnails.length > 0) {
      await attachmentRepo.remove(thumbnails);
    }
  }

  async deleteContentImageAttachments(recordId: string, recordType: string, manager: EntityManager) {
    const attachmentRepo = manager.getRepository(AttachmentEntity);

    const contentImages = await attachmentRepo.find({
      where: {
        name: 'contentImage',
        recordType,
        recordId,
      },
    });

    if (contentImages.length > 0) {
      await attachmentRepo.remove(contentImages);
    }
  }
}
