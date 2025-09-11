import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { FileUploadApplicationService } from './file-upload-application.service';
import { FileUploadApiController } from './file-upload.api.controller';
import { FileCleanupService } from './services/file-cleanup.service';
import { FileUploadService } from './services/file-upload.service';
import { GoogleVisionService } from './services/google-vision.service';
import { R2Service } from './services/r2.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
  ],
  controllers: [
    FileUploadApiController,
  ],
  providers: [
    FileUploadApplicationService,
    FileUploadService,
    R2Service,
    FileCleanupService,
    GoogleVisionService
  ]
})
export class FileUploadModule {}
