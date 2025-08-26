import { Module } from '@nestjs/common';

import { AppModule } from './app/app.module';
import { ConfigModule } from './config';
import { LoggerModule } from './logger';
import { SharedModule } from './shared';

@Module({
  imports: [
    // prettier-ignore
    LoggerModule,
    ConfigModule,
    AppModule,
    SharedModule,
  ],
})
export class MainModule {}
