import { eq } from 'drizzle-orm';

import { DbProvider } from 'src/shared/drizzle/db-provider';
import { SelectUser, users } from 'src/shared/drizzle/schema';

export type UserID = number;

export type CreateUserData = {
  readonly email: string;
  readonly nickname: string;
};

export class UserEntity implements SelectUser {
  readonly id: UserID;
  readonly email: string;
  readonly nickname: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  private constructor() { }

  // -------------------------------------------------------------------------------------------
  // STATIC METHODS
  // -------------------------------------------------------------------------------------------

  static create(data: CreateUserData): UserEntity {
    const user = new UserEntity();
    Object.assign(user, {
      email: data.email,
      nickname: data.nickname
    });
    return user;
  }

  static fromRaw(data: SelectUser) {
    const user = new UserEntity();
    Object.assign(user, data);
    return user;
  }

  static async findByEmail(email: string): Promise<UserEntity | null> {
    const executor = DbProvider.getExecutor();
    const result = await executor
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return result.length > 0 ? UserEntity.fromRaw(result[0]) : null;
  }

  // -------------------------------------------------------------------------------------------
  // INSTANCE METHODS
  // -------------------------------------------------------------------------------------------

  async save() {
    const executor = DbProvider.getExecutor();
    const [raw] = await executor
      .insert(users)
      .values(this)
      .returning();
    return UserEntity.fromRaw(raw);
  }
}