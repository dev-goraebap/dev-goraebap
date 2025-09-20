import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool, PoolConfig } from 'pg';

import * as schema from './schema';

export const DRIZZLE = Symbol('DRIZZLE');
export type DrizzleDB = NodePgDatabase<typeof schema>;

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: DRIZZLE,
      useFactory: (configService: ConfigService) => {
        const host = configService.get<string>('DB_HOST');
        const port = Number(configService.get<string>('DB_PORT'));
        const database = configService.get<string>('DB_NAME');
        const user = configService.get<string>('DB_USERNAME');
        const password = configService.get<string>('DB_PASSWORD');
        const config: PoolConfig = {
          host,
          port,
          database,
          user,
          password,
          max: 20,
          idleTimeoutMillis: 30000,
        };
        const pool = new Pool(config);
        return drizzle(pool, { schema });
      },
      inject: [ConfigService],
    },
  ],
  exports: [DRIZZLE],
})
export class DrizzleModule {}
