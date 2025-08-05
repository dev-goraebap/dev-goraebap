import { Logger, Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';

import { AppExceptionFilter } from 'src/common';

import { AdminModule } from './admin/admin.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    AdminModule,
  ],
  controllers: [AppController],
  providers: [
    { provide: APP_FILTER, useClass: AppExceptionFilter },
  ],
})
export class AppModule {
  constructor() {
    Logger.debug(`.env.${process.env.NODE_ENV}.local`);
  }
}
