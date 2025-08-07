import { Module } from '@nestjs/common';

import { AppModule } from './app/app.module';
import { ConfigModule } from './config';

@Module({
  imports: [
    ConfigModule,
    AppModule
  ],
})
export class MainModule {}
