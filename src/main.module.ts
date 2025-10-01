import { Module } from '@nestjs/common';

import { ApiModule } from './api/api.module';
import { AppModule } from './app/app.module';
import { ConfigModule } from './shared/config';
import { InfraModule } from './infra/infra.module';
import { CloudFlareR2Module } from './shared/cloudflare-r2';
import { DrizzleModule } from './shared/drizzle';
import { GoogleVisionAiModule } from './shared/google-vision-ai';
import { LoggerModule } from './shared/logger';

@Module({
  imports: [
    DrizzleModule,
    LoggerModule,
    GoogleVisionAiModule,
    CloudFlareR2Module,
    ConfigModule,
    InfraModule,
    AppModule,
    ApiModule
  ],
})
export class MainModule { }
