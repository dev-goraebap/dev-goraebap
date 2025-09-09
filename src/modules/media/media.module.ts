import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { FileCleanupService } from './application/services/file-cleanup.service';
import { FileUploadApplicationService } from './application/services/file-upload-application.service';
import { GoogleVisionService } from './infrastructure/google-vision.service';
import { R2Service } from './infrastructure/r2.service';
import { MediaSharedModule } from './media-shared.module';
import { FileUploadApiController } from './presentation/file-upload.api.controller';

// prettier-ignore
@Module({
  imports: [
    ScheduleModule.forRoot(),
    MediaSharedModule
  ],
  controllers: [
    FileUploadApiController
  ],
  providers: [
    FileUploadApplicationService, 
    R2Service, 
    FileCleanupService, 
    GoogleVisionService
  ],
})
export class MediaModule {}
