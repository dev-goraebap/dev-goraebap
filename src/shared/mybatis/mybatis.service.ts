// common/sql-mapper.service.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as glob from 'glob';
import * as mybatisMapper from 'mybatis-mapper';

@Injectable()
export class MybatisService implements OnModuleInit {

  private readonly logger = new Logger(MybatisService.name);

  onModuleInit() {
    this.logger.debug('Init MybatisService');

    // 모든 도메인의 mapper.xml 파일을 찾아서 로드
    const mapperFiles = glob.sync('src/**/mappers/*.xml');

    if (mapperFiles.length > 0) {
      mybatisMapper.createMapper(mapperFiles);
      console.log('Loaded mapper files:', mapperFiles);
    }
  }

  getStatement(namespace: string, sql: string, param?: mybatisMapper.Params, format?: mybatisMapper.Format) {
    return mybatisMapper.getStatement(namespace, sql, param, format);
  }
}