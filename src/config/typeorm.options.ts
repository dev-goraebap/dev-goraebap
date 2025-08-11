import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { join } from 'path';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

import { AttachmentEntity, BlobEntity, PostEntity, SeriesEntity, TagEntity, UserEntity } from 'src/shared';

@Injectable()
export class TypeOrmOptionsImpl implements TypeOrmOptionsFactory {
  createTypeOrmOptions(): Promise<TypeOrmModuleOptions> | TypeOrmModuleOptions {
    return {
      type: 'better-sqlite3',
      database: join(process.cwd(), 'storage', 'development.sqlite'),
      synchronize: true,
      logger: 'debug',
      logging: true,
      entities: [
        UserEntity,
        BlobEntity,
        AttachmentEntity,
        PostEntity,
        SeriesEntity,
        TagEntity
      ],
      namingStrategy: new SnakeNamingStrategy()
    };
  }
}
