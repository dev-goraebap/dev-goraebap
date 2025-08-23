import { Module } from '@nestjs/common';

import { AppModule } from './app/app.module';
import { ConfigModule } from './config';
import { LoggerModule } from './logger';

@Module({
  imports: [ConfigModule, AppModule, LoggerModule],
})
export class MainModule {}
