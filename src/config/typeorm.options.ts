import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { join } from 'path';

import { AttachmentEntity, BlobEntity } from 'src/shared';

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
        BlobEntity,
        AttachmentEntity
      ],
    };
  }
}
