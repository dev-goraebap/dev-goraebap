import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { and, eq, getTableColumns, isNull, lt } from 'drizzle-orm';

import { CloudflareR2Service } from 'src/core/infrastructure/services';
import { attachments, blobs, DRIZZLE, DrizzleOrm } from 'src/shared/drizzle';

@Injectable()
export class MediaCleanupService {
  private readonly logger = new Logger(MediaCleanupService.name);

  constructor(
    @Inject(DRIZZLE)
    private readonly drizzle: DrizzleOrm,
    private readonly cloudflareR2Service: CloudflareR2Service,
  ) { }

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async cleanupOrphanFiles(): Promise<void> {
    this.logger.log('Starting orphan files cleanup...');

    try {
      const orphanBlobs = await this.findOrphanBlobs();
      this.logger.log(`Found ${orphanBlobs.length} orphan files`);

      let deletedCount = 0;
      let errorCount = 0;

      for (const blob of orphanBlobs) {
        try {
          await this.cloudflareR2Service.deleteFile(blob.key);
          await this.drizzle
            .delete(blobs)
            .where(eq(blobs.id, blob.id));

          deletedCount++;
          this.logger.log(`Orphan file deleted: ${blob.key}`);
        } catch (error) {
          errorCount++;
          this.logger.error(`Failed to delete orphan file: ${blob.key}`, error);
        }
      }

      this.logger.log(`Orphan files cleanup completed. Deleted: ${deletedCount}, Errors: ${errorCount}`);
    } catch (error) {
      this.logger.error('Failed to execute orphan files cleanup', error);
    }
  }

  async findOrphanBlobs() {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // 1. attachments 테이블에서 참조되지 않는 blob (고아 파일)
    // 2. 24시간 이전에 생성된 blob
    // 위 조건을 만족하는 대상의 파일 데이터 조회
    return await this.drizzle
      .select(getTableColumns(blobs))
      .from(blobs)
      .leftJoin(attachments, eq(attachments.blobId, blobs.id))
      .where(
        and(
          isNull(attachments.id),
          lt(blobs.createdAt, twentyFourHoursAgo.toISOString())
        )
      );
  }

  async manualCleanup(): Promise<{ deleted: number; errors: number }> {
    this.logger.log('Starting manual orphan files cleanup...');

    const orphanBlobs = await this.findOrphanBlobs();
    let deletedCount = 0;
    let errorCount = 0;

    for (const blob of orphanBlobs) {
      try {
        await this.cloudflareR2Service.deleteFile(blob.key);
        await this.drizzle
          .delete(blobs)
          .where(eq(blobs.id, blob.id));
        deletedCount++;
      } catch (error) {
        errorCount++;
        this.logger.error(`Failed to delete orphan file: ${blob.key}`, error);
      }
    }

    return { deleted: deletedCount, errors: errorCount };
  }
}