import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CloudflareR2Service } from 'src/core/infrastructure/services';
import { BlobEntity } from 'src/core/infrastructure/entities';

@Injectable()
export class MediaCleanupService {
  private readonly logger = new Logger(MediaCleanupService.name);

  constructor(
    @InjectRepository(BlobEntity)
    private readonly blobRepository: Repository<BlobEntity>,
    private readonly cloudflareR2Service: CloudflareR2Service,
  ) {}

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
          await this.blobRepository.remove(blob);
          
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

  async findOrphanBlobs(): Promise<BlobEntity[]> {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    return this.blobRepository
      .createQueryBuilder('blob')
      .leftJoin('blob.attachments', 'attachment')
      .where('attachment.id IS NULL')
      .andWhere('blob.createdAt < :date', { date: twentyFourHoursAgo })
      .getMany();
  }

  async manualCleanup(): Promise<{ deleted: number; errors: number }> {
    this.logger.log('Starting manual orphan files cleanup...');
    
    const orphanBlobs = await this.findOrphanBlobs();
    let deletedCount = 0;
    let errorCount = 0;

    for (const blob of orphanBlobs) {
      try {
        await this.cloudflareR2Service.deleteFile(blob.key);
        await this.blobRepository.remove(blob);
        deletedCount++;
      } catch (error) {
        errorCount++;
        this.logger.error(`Failed to delete orphan file: ${blob.key}`, error);
      }
    }

    return { deleted: deletedCount, errors: errorCount };
  }
}