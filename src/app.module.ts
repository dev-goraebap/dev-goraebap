import { Logger, Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NestMvcModule } from 'nestjs-mvc-tools';

import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { AppExceptionFilter } from './app-exception.filter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminModule } from './app/admin/admin.module';
import {
  currentThemeHelper,
  isCurrentRouteHelper,
  queryHelper,
} from './common';
import { TypeOrmOptionsImpl } from './config/typeorm.options';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(process.cwd(), `.env.${process.env.NODE_ENV}.local`),
    }),
    TypeOrmModule.forRootAsync({ useClass: TypeOrmOptionsImpl }),
    NestMvcModule.forRoot({
      view: {
        helpers: [isCurrentRouteHelper, currentThemeHelper, queryHelper],
      },
      debug: true,
    }),
    AdminModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_FILTER, useClass: AppExceptionFilter },
  ],
})
export class AppModule {
  constructor() {
    Logger.debug(`.env.${process.env.NODE_ENV}.local`);
  }
}
