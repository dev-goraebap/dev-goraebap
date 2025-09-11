import { Module } from '@nestjs/common';

import { AppRefactoredModule } from './app-refactored.module';
import { ConfigModule } from './config';
import { LoggerModule } from './logger';
import { SharedModule } from './shared';

@Module({
  imports: [
    // prettier-ignore
    LoggerModule,
    ConfigModule,
    AppRefactoredModule,
    SharedModule,
  ],
})
export class MainModule {}
