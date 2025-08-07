import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BlobEntity } from 'src/shared/entities/blob.entity';
import { FileUploadApiController } from './file-upload.api.controller';
import { FileCleanupService } from './services/file-cleanup.service';
import { FileUploadService } from './services/file-upload.service';
import { GoogleVisionService } from './services/google-vision.service';
import { R2Service } from './services/r2.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([BlobEntity]),
    ScheduleModule.forRoot(),
  ],
  controllers: [
    FileUploadApiController,
  ],
  providers: [
    FileUploadService,
    R2Service,
    FileCleanupService,
    GoogleVisionService
  ]
})
export class FileUploadModule {}
