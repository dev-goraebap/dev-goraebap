import { Module } from '@nestjs/common';

import { ConfigModule } from './config';
import { PresentationModule } from './core/presentation/presentation.module';
import { LoggerModule } from './shared';
import { MybatisModule } from './shared/mybatis';

@Module({
  imports: [
    // prettier-ignore
    LoggerModule,
    ConfigModule,
    PresentationModule,
    MybatisModule
  ],
})
export class MainModule {}
