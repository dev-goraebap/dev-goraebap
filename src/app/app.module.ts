import { Logger, Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';

import { AppExceptionFilter } from 'src/common';

import { AdminModule } from './admin/admin.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostsModule } from './posts/posts.module';
import { SeriesModule } from './series/series.module';
import { SessionModule } from './session/session.module';

@Module({
  imports: [
    AdminModule,
    SessionModule,
    PostsModule,
    SeriesModule
  ],
  controllers: [AppController],
  providers: [
    { provide: APP_FILTER, useClass: AppExceptionFilter },
    AppService
  ],
})
export class AppModule {
  constructor() {
    Logger.debug(`.env.${process.env.NODE_ENV}.local`);
  }
}
