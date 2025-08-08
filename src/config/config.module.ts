import { Global, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NestMvcModule } from 'nestjs-mvc-tools';
import { join } from 'path';

import { AttachmentEntity, BlobEntity, PostEntity, SeriesEntity, TagEntity } from 'src/shared';
import { nestMvcOptions } from './nest-mvc.options';
import { TypeOrmOptionsImpl } from './typeorm.options';

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(process.cwd(), `.env.${process.env.NODE_ENV}.local`),
    }),
    TypeOrmModule.forRootAsync({ useClass: TypeOrmOptionsImpl }),
    TypeOrmModule.forFeature([PostEntity, TagEntity, SeriesEntity, BlobEntity, AttachmentEntity]),
    NestMvcModule.forRoot(nestMvcOptions),
  ],
  exports: [
    TypeOrmModule
  ]
})
export class ConfigModule {}
