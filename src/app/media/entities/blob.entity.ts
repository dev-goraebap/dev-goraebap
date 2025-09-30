import { and, eq, getTableColumns, isNull, lt } from "drizzle-orm";

import { R2PathHelper } from "src/shared/cloudflare-r2";
import { attachments, blobs, DrizzleContext, InsertBlob, SelectBlob } from "src/shared/drizzle";
import { MediaUploadResponseDto } from "../dto/media-upload-response.dto";

export class BlobEntity implements SelectBlob {
  private constructor(
    readonly id: number,
    readonly key: string,
    readonly filename: string,
    readonly contentType: string,
    readonly serviceName: string,
    readonly byteSize: number,
    readonly checksum: string,
    readonly createdBy: string,
    readonly createdAt: Date,
    readonly metadata: string,
  ) { }

  static fromRaw(data: SelectBlob): BlobEntity {
    return new BlobEntity(
      data.id,
      data.key,
      data.filename,
      data.contentType,
      data.serviceName,
      data.byteSize,
      data.checksum,
      data.createdBy,
      data.createdAt,
      data.metadata,
    );
  }

  static async findById(id: number): Promise<BlobEntity | null> {
    const result = await DrizzleContext.db().query.blobs.findFirst({
      where: eq(blobs.id, id)
    });
    return result ? BlobEntity.fromRaw(result) : null;
  }

  static async findByChecksum(checksum: string): Promise<BlobEntity | null> {
    const result = await DrizzleContext.db().query.blobs.findFirst({
      where: eq(blobs.checksum, checksum)
    });
    return result ? BlobEntity.fromRaw(result) : null;
  }

  static async create(data: InsertBlob): Promise<BlobEntity> {
    const [rawBlob] = await DrizzleContext.db()
      .insert(blobs)
      .values(data)
      .returning();
    return BlobEntity.fromRaw(rawBlob);
  }

  static async findOrphans(hoursAgo: number): Promise<BlobEntity[]> {
    const cutoffTime = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);

    const results = await DrizzleContext.db()
      .select(getTableColumns(blobs))
      .from(blobs)
      .leftJoin(attachments, eq(attachments.blobId, blobs.id))
      .where(
        and(
          isNull(attachments.id),
          lt(blobs.createdAt, cutoffTime)
        )
      );

    return results.map(raw => BlobEntity.fromRaw(raw));
  }

  static async delete(id: number): Promise<void> {
    await DrizzleContext.db()
      .delete(blobs)
      .where(eq(blobs.id, id));
  }

  getPublicUrl(): string {
    return R2PathHelper.getPublicUrl(this.key);
  }

  toResponse(): MediaUploadResponseDto {
    return {
      blobId: this.id,
      key: this.key,
      filename: this.filename,
      contentType: this.contentType,
      byteSize: this.byteSize,
      url: this.getPublicUrl(),
      metadata: this.metadata ? JSON.parse(this.metadata) : {},
    };
  }
}