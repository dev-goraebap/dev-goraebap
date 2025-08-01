import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { NestMvcModule } from 'nestjs-mvc-tools';

import { AdminModule } from './admin/admin.module';
import { AppExceptionFilter } from './app-exception.filter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {
  currentThemeHelper,
  isCurrentRouteHelper,
} from './common/view.helpers';

@Module({
  imports: [
    NestMvcModule.forRoot({
      view: {
        helpers: [isCurrentRouteHelper, currentThemeHelper],
      },
    }),
    AdminModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_FILTER, useClass: AppExceptionFilter },
  ],
})
export class AppModule {}
