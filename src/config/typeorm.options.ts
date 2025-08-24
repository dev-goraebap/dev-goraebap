import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

import {
  AttachmentEntity,
  BlobEntity,
  CommentEntity,
  PostEntity,
  SeriesEntity,
  SeriesPostEntity,
  TagEntity,
  UserEntity,
} from 'src/shared';

@Injectable()
export class TypeOrmOptionsImpl implements TypeOrmOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createTypeOrmOptions(): Promise<TypeOrmModuleOptions> | TypeOrmModuleOptions {
    const host = this.configService.get('DB_HOST');
    const port = this.configService.get('DB_PORT');
    const username = this.configService.get('DB_USERNAME');
    const password = this.configService.get('DB_PASSWORD');
    const database = this.configService.get('DB_NAME');

    return {
      type: 'postgres',
      host,
      port,
      username,
      password,
      database,
      synchronize: process.env.NODE_ENV !== 'production',
      logger: 'debug',
      logging: true,
      entities: [
        UserEntity,
        BlobEntity,
        AttachmentEntity,
        PostEntity,
        SeriesEntity,
        SeriesPostEntity,
        TagEntity,
        CommentEntity
      ],
      namingStrategy: new SnakeNamingStrategy(),
    };
  }
}
