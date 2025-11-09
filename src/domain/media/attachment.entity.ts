import { BadRequestException } from '@nestjs/common';
import { and, eq, inArray } from 'drizzle-orm';

import { attachments, blobs, DrizzleContext, InsertAttachment, SelectAttachment } from 'src/shared/drizzle';
import { extractImageUrls } from 'src/shared/utils';
import { BlobEntity } from './blob.entity';

export class AttachmentEntity implements SelectAttachment {
  readonly id!: number;
  readonly name!: string;
  readonly recordType!: string;
  readonly recordId!: string;
  readonly blobId!: number;
  readonly createdAt!: Date;

  static fromRaw(data: SelectAttachment): AttachmentEntity {
    return Object.assign(new AttachmentEntity(), {
      id: data.id,
      name: data.name,
      recordType: data.recordType,
      recordId: data.recordId,
      blobId: data.blobId,
      createdAt: data.createdAt,
    } satisfies Partial<AttachmentEntity>);
  }

  static async createThumbnail(
    blobId: number,
    recordId: string,
    recordType: string,
  ): Promise<AttachmentEntity> {
    const blob = await BlobEntity.findById(blobId);
    if (!blob) {
      throw new BadRequestException('썸네일 파일이 존재하지 않습니다.');
    }

    try {
      const [raw] = await DrizzleContext.db()
        .insert(attachments)
        .values({
          blobId: blob.id,
          name: 'thumbnail',
          recordType,
          recordId,
        })
        .returning();
      return AttachmentEntity.fromRaw(raw);
    } catch (err: any) {
      throw new BadRequestException(err.cause?.detail);
    }
  }

  static async createContentImages(
    content: string,
    recordId: string,
    recordType: string,
  ): Promise<AttachmentEntity[]> {
    const blobKeys = this.extractBlobKeysFromContent(content);

    if (blobKeys.length === 0) return [];

    const blobResults = await DrizzleContext.db()
      .select()
      .from(blobs)
      .where(inArray(blobs.key, blobKeys));

    if (blobResults.length === 0) return [];

    const attachmentValues: InsertAttachment[] = blobResults.map((blob) => ({
      blobId: blob.id,
      name: 'contentImage',
      recordType,
      recordId,
    }));

    const results = await DrizzleContext.db()
      .insert(attachments)
      .values(attachmentValues)
      .returning();

    return results.map(raw => AttachmentEntity.fromRaw(raw));
  }

  static async updateThumbnail(
    blobId: number,
    recordId: string,
    recordType: string,
  ): Promise<void> {
    await this.deleteThumbnails(recordId, recordType);
    await this.createThumbnail(blobId, recordId, recordType);
  }

  static async updateContentImages(
    content: string,
    recordId: string,
    recordType: string,
  ): Promise<void> {
    await this.deleteContentImages(recordId, recordType);
    await this.createContentImages(content, recordId, recordType);
  }

  static async deleteAll(recordId: string, recordType: string): Promise<void> {
    await DrizzleContext.db()
      .delete(attachments)
      .where(
        and(
          eq(attachments.recordType, recordType),
          eq(attachments.recordId, recordId)
        )
      );
  }

  static async deleteThumbnails(recordId: string, recordType: string): Promise<void> {
    await DrizzleContext.db()
      .delete(attachments)
      .where(
        and(
          eq(attachments.name, 'thumbnail'),
          eq(attachments.recordType, recordType),
          eq(attachments.recordId, recordId)
        )
      );
  }

  static async deleteContentImages(recordId: string, recordType: string): Promise<void> {
    await DrizzleContext.db()
      .delete(attachments)
      .where(
        and(
          eq(attachments.name, 'contentImage'),
          eq(attachments.recordType, recordType),
          eq(attachments.recordId, recordId)
        )
      );
  }

  private static extractBlobKeysFromContent(content: string): string[] {
    const imageUrls = extractImageUrls(content);

    if (imageUrls.length === 0) return [];

    const blobKeys: string[] = imageUrls
      .map((url) => url.match(/([a-f0-9]{32})$/)?.[1])
      .filter(Boolean) as string[];

    return blobKeys;
  }
}