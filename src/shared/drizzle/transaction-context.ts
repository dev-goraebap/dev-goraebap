import { Inject, Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { DRIZZLE, DrizzleOrm, DrizzleTransaction } from './drizzle.module';

@Injectable()
export class TransactionContext {
  private als = new AsyncLocalStorage<DrizzleTransaction>();

  constructor(@Inject(DRIZZLE) private db: DrizzleOrm) {}

  async runInTransaction<T>(callback: () => Promise<T>): Promise<T> {
    return await this.db.transaction(async (tx) => {
      return await this.als.run(tx, callback);
    });
  }

  getCurrentTransaction(): DrizzleTransaction | undefined {
    return this.als.getStore();
  }
}