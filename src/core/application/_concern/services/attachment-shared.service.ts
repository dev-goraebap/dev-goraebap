import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { and, eq, inArray } from 'drizzle-orm';
import { PgTransaction } from 'drizzle-orm/pg-core';

import { extractImageUrls } from 'src/shared';
import { attachments, blobs, DRIZZLE, DrizzleOrm, SelectAttachment } from 'src/shared/drizzle';

@Injectable()
export class AttachmentSharedService {
  constructor(
    @Inject(DRIZZLE)
    private readonly drizzle: DrizzleOrm,
  ) { }

  async createThumbnailAttachment(
    blobId: number,
    recordId: string,
    recordType: string,
    tx: PgTransaction<any>,
  ): Promise<SelectAttachment> {
    const blob = await this.drizzle.query.blobs.findFirst({
      where: eq(blobs.id, blobId)
    })
    if (!blob) {
      throw new BadRequestException('썸네일 파일이 존재하지 않습니다.');
    }

    try {
      return (
        await tx.insert(attachments)
          .values({
            blobId: blob.id,
            name: 'thumbnail',
            recordType,
            recordId,
          })
          .returning()
      )[0]
    } catch (err) {
      throw new BadRequestException(err.cause?.detail);
    }
  }

  async createContentImageAttachments(content: string, recordId: string, recordType: string, tx: PgTransaction<any>) {
    const imageUrls = extractImageUrls(content);

    if (imageUrls.length === 0) return [];

    const blobKeys: string[] = imageUrls
      .map((url) => url.match(/([a-f0-9]{32})$/)?.[1])
      .filter(Boolean) as string[];

    if (blobKeys.length === 0) return [];

    const blobResults = await tx
      .select()
      .from(blobs)
      .where(inArray(blobs.key, blobKeys));

    if (blobResults.length === 0) return [];

    const attachmentValues = blobResults.map((blob) => ({
      blobId: blob.id,
      name: 'contentImage',
      recordType,
      recordId,
    }));

    return await tx.insert(attachments).values(attachmentValues).returning();
  }

  async updateThumbnailAttachment(blobId: number, recordId: string, recordType: string, tx: PgTransaction<any>) {
    // 1. 기존 썸네일 제거
    await this.deleteThumbnailAttachments(recordId, recordType, tx);

    // 2. 새 썸네일 생성
    await this.createThumbnailAttachment(blobId, recordId, recordType, tx);
  }

  async updateContentImageAttachments(content: string, recordId: string, recordType: string, tx: PgTransaction<any>) {
    // 1. 기존 콘텐츠 이미지 모두 제거
    await this.deleteContentImageAttachments(recordId, recordType, tx);

    // 2. 새 콘텐츠 이미지 생성
    await this.createContentImageAttachments(content, recordId, recordType, tx);
  }

  async deleteAllAttachments(recordId: string, recordType: string, tx: PgTransaction<any>) {
    await tx
      .delete(attachments)
      .where(
        and(
          eq(attachments.recordType, recordType),
          eq(attachments.recordId, recordId)
        )
      );
  }

  async deleteThumbnailAttachments(recordId: string, recordType: string, tx: PgTransaction<any>) {
    await tx
      .delete(attachments)
      .where(
        and(
          eq(attachments.name, 'thumbnail'),
          eq(attachments.recordType, recordType),
          eq(attachments.recordId, recordId)
        )
      );
  }

  async deleteContentImageAttachments(recordId: string, recordType: string, tx: PgTransaction<any>) {
    await tx
      .delete(attachments)
      .where(
        and(
          eq(attachments.name, 'contentImage'),
          eq(attachments.recordType, recordType),
          eq(attachments.recordId, recordId)
        )
      );
  }
}
