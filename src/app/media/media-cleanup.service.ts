import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { CloudflareR2Service } from 'src/shared/cloudflare-r2';
import { BlobEntity } from './entities/blob.entity';

@Injectable()
export class MediaCleanupService {
  private readonly logger = new Logger(MediaCleanupService.name);

  constructor(
    private readonly cloudflareR2Service: CloudflareR2Service,
  ) { }

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async cleanupOrphanFiles(): Promise<void> {
    this.logger.log('Starting orphan files cleanup...');

    try {
      const orphanBlobs = await BlobEntity.findOrphans(24);
      this.logger.log(`Found ${orphanBlobs.length} orphan files`);

      let deletedCount = 0;
      let errorCount = 0;

      for (const blob of orphanBlobs) {
        try {
          await this.cloudflareR2Service.deleteFile(blob.key);
          await BlobEntity.delete(blob.id);

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

  async manualCleanup(): Promise<{ deleted: number; errors: number }> {
    this.logger.log('Starting manual orphan files cleanup...');

    const orphanBlobs = await BlobEntity.findOrphans(24);
    let deletedCount = 0;
    let errorCount = 0;

    for (const blob of orphanBlobs) {
      try {
        await this.cloudflareR2Service.deleteFile(blob.key);
        await BlobEntity.delete(blob.id);
        deletedCount++;
      } catch (error) {
        errorCount++;
        this.logger.error(`Failed to delete orphan file: ${blob.key}`, error);
      }
    }

    return { deleted: deletedCount, errors: errorCount };
  }
}