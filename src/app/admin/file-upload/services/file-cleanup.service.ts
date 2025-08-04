import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlobEntity } from '../../../../shared/entities/blob.entity';
import { R2Service } from './r2.service';

@Injectable()
export class FileCleanupService {
  private readonly logger = new Logger(FileCleanupService.name);

  constructor(
    @InjectRepository(BlobEntity)
    private readonly blobRepository: Repository<BlobEntity>,
    private readonly r2Service: R2Service,
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
          // 1. R2에서 파일 삭제
          await this.r2Service.deleteFile(blob.key);
          
          // 2. DB에서 BlobEntity 삭제
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
    // 24시간 이전에 생성되었고 attachment가 없는 blob들 찾기
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    return this.blobRepository
      .createQueryBuilder('blob')
      .leftJoin('blob.attachments', 'attachment')
      .where('attachment.id IS NULL')
      .andWhere('blob.createdAt < :date', { date: twentyFourHoursAgo })
      .getMany();
  }

  // 수동으로 정리 작업을 실행할 수 있는 메서드
  async manualCleanup(): Promise<{ deleted: number; errors: number }> {
    this.logger.log('Starting manual orphan files cleanup...');
    
    const orphanBlobs = await this.findOrphanBlobs();
    let deletedCount = 0;
    let errorCount = 0;

    for (const blob of orphanBlobs) {
      try {
        await this.r2Service.deleteFile(blob.key);
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