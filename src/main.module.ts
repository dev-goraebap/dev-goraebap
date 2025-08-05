import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NestMvcModule } from 'nestjs-mvc-tools';
import { join } from 'path';

import { AppModule } from './app/app.module';
import { currentThemeHelper, isCurrentRouteHelper, queryHelper, TypeOrmOptionsImpl } from './config';

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
    AppModule
  ],
})
export class MainModule {}
