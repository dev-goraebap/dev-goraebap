import { Module } from '@nestjs/common';
import { FileUploadApiController } from './file-upload.api.controller';

@Module({
  imports: [],
  controllers: [
    FileUploadApiController
  ],
})
export class FileUploadModule {}
