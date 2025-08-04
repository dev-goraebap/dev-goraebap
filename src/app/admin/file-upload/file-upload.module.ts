import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { FileUploadApiController } from './file-upload.api.controller';
import { FileUploadTestController } from './file-upload.test.controller';
import { FileUploadService } from './services/file-upload.service';
import { R2Service } from './services/r2.service';
import { FileCleanupService } from './services/file-cleanup.service';
import { BlobEntity } from '../../../shared/entities/blob.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([BlobEntity]),
    ScheduleModule.forRoot(),
  ],
  controllers: [
    FileUploadApiController,
    FileUploadTestController,
  ],
  providers: [
    FileUploadService,
    R2Service,
    FileCleanupService,
  ],
  exports: [
    FileUploadService,
    R2Service,
    FileCleanupService,
  ],
})
export class FileUploadModule {}
