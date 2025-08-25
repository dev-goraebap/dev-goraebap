import { Module } from '@nestjs/common';

import { AppModule } from './app/app.module';
import { ConfigModule } from './config';
import { LoggerModule } from './logger';
import { SharedModule } from './shared';

@Module({
  imports: [ConfigModule, AppModule, SharedModule, LoggerModule],
})
export class MainModule {}
