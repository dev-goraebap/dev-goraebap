import { Global, Logger, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { NestMvcModule } from 'nestjs-mvc-tools';
import { join } from 'path';

import { nestMvcOptions } from './nest-mvc.options';

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(process.cwd(), `.env.${process.env.NODE_ENV}.local`),
    }),
    NestMvcModule.forRoot(nestMvcOptions),
  ],
})
export class ConfigModule {
  constructor() {
    Logger.debug(`ENV: ${process.env.NODE_ENV}`);
  }
}
