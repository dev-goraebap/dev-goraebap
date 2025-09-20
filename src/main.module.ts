import { Module } from '@nestjs/common';

import { ConfigModule } from './config';
import { PresentationModule } from './core/presentation/presentation.module';
import { LoggerModule } from './shared';
import { DrizzleModule } from './shared/drizzle';

@Module({
  imports: [
    // prettier-ignore
    LoggerModule,
    ConfigModule,
    PresentationModule,
    DrizzleModule
  ],
})
export class MainModule {}
