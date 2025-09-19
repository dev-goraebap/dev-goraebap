import { Module } from '@nestjs/common';

import { ConfigModule } from './config';
import { PresentationModule } from './core/presentation/presentation.module';
import { LoggerModule } from './shared';

@Module({
  imports: [
    // prettier-ignore
    LoggerModule,
    ConfigModule,
    PresentationModule
  ],
})
export class MainModule {}
