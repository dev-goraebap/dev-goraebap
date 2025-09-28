import { DrizzleOrm } from './drizzle.module';
import { TransactionContext } from './transaction-context';

export class DbProvider {
  private static db: DrizzleOrm;
  private static txContext: TransactionContext;

  static setDb(db: DrizzleOrm, txContext: TransactionContext) {
    this.db = db;
    this.txContext = txContext;
  }

  static getDb(): DrizzleOrm {
    if (!this.db) {
      throw new Error('DB not initialized. Make sure DbProvider.setDb() is called in DrizzleModule.');
    }
    return this.db;
  }

  static getTxContext(): TransactionContext {
    if (!this.txContext) {
      throw new Error('TransactionContext not initialized. Make sure DbProvider.setDb() is called in DrizzleModule.');
    }
    return this.txContext;
  }

  static getExecutor() {
    const txContext = this.getTxContext();
    return txContext.getCurrentTransaction() || this.getDb();
  }

  // 트랜잭션 실행을 위한 편의 메서드
  static async runInTransaction<T>(callback: () => Promise<T>): Promise<T> {
    const db = this.getDb();
    const txContext = this.getTxContext();
    return await txContext.runInTransaction(db, callback);
  }
}