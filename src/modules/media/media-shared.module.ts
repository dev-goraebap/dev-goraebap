import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AttachmentEntity } from './infrastructure/entities/attachment.entity';
import { BlobEntity } from './infrastructure/entities/blob.entity';

// prettier-ignore
@Module({
  imports: [
    TypeOrmModule.forFeature([
      AttachmentEntity,
      BlobEntity
    ]),
  ],
  exports: [
    TypeOrmModule
  ]
})
export class MediaSharedModule {}
