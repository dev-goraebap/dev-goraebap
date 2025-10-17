import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { AppModule } from './app/app.module';
import { FeaturesModule } from './features/features.module';
import { InfraModule } from './infra/infra.module';
import { CloudFlareR2Module } from './shared/cloudflare-r2';
import { ConfigModule } from './shared/config';
import { DrizzleModule } from './shared/drizzle';
import { GoogleVisionAiModule } from './shared/google-vision-ai';
import { LoggerModule } from './shared/logger';

@Module({
  imports: [
    // 앱 지원 모듈
    ScheduleModule.forRoot(),
    DrizzleModule,
    LoggerModule,
    GoogleVisionAiModule,
    CloudFlareR2Module,
    ConfigModule,
    // 앱 기능 모듈
    AppModule,
    FeaturesModule,
    InfraModule,
  ],
})
export class MainModule { }
