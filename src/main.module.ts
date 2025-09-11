import { Module } from '@nestjs/common';

import { ConfigModule } from './config';
import { AppRefactoredModule } from './presentation/presentation.module';
import { LoggerModule, SharedModule } from './shared';

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
