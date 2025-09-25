import { Module } from '@nestjs/common';

import { AppModule } from './app/app.module';
import { ConfigModule } from './config';
import { CloudFlareR2Module } from './shared/cloudflare-r2';
import { DrizzleModule } from './shared/drizzle';
import { GoogleVisionAiModule } from './shared/google-vision-ai';
import { LoggerModule } from './shared/logger';

@Module({
  imports: [
    // prettier-ignore
    DrizzleModule,
    LoggerModule,
    GoogleVisionAiModule,
    CloudFlareR2Module,
    ConfigModule,
    AppModule,
  ],
})
export class MainModule {}
