import { Module } from '@nestjs/common';

import { MediaCleanupService } from './orchestrators/media-cleanup.service';
import { MediaUploadService } from './orchestrators/media-upload.service';
import { MediaService } from './services/media.service';

const services = [
  MediaService,
  MediaCleanupService,
  MediaUploadService,
];

@Module({
  providers: [
    ...services,
  ],
  exports: [
    ...services,
  ],
})
export class MediaModule { }