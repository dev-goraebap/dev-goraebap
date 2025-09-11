import { Module } from '@nestjs/common';

import { MediaUploadService } from './application/orchestrators/media-upload.service';
import { MediaAnalysisService } from './application/services/media-analysis.service';
import { MediaCleanupService } from './application/services/media-cleanup.service';
import { MediaStorageService } from './application/services/media-storage.service';
import { MediaService } from './application/services/media.service';

@Module({
  providers: [
    // Level 1: 순수 도메인 서비스
    MediaService,
    MediaStorageService,
    MediaAnalysisService,
    MediaCleanupService,
    // Level 2: 오케스트레이션 서비스
    MediaUploadService,
  ],
  exports: [
    MediaService,
    MediaStorageService,
    MediaAnalysisService,
    MediaCleanupService,
    MediaUploadService,
  ],
})
export class MediaModule {}