import { eq } from "drizzle-orm";

import { DrizzleContext, InsertUser, SelectUser, users } from "src/shared/drizzle";

export type UserID = number;

export class UserEntity implements SelectUser {
  private constructor(
    readonly id: UserID,
    readonly email: string,
    readonly nickname: string,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) { }

  static fromRaw(data: SelectUser): UserEntity {
    return new UserEntity(
      data.id,
      data.email,
      data.nickname,
      data.createdAt,
      data.updatedAt
    );
  }

  static async findByEmail(email: string): Promise<UserEntity | null> {
    const result = await DrizzleContext.db()
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return result.length > 0 ? UserEntity.fromRaw(result[0]) : null;
  }

  static async findById(id: number): Promise<UserEntity | null> {
    const result = await DrizzleContext.db().query.users.findFirst({
      where: eq(users.id, id)
    });
    return result ? UserEntity.fromRaw(result) : null;
  }

  static async existsByEmail(email: string): Promise<boolean> {
    const user = await this.findByEmail(email);
    return user !== null;
  }

  static async create(data: InsertUser): Promise<UserEntity> {
    const [rawUser] = await DrizzleContext.db()
      .insert(users)
      .values(data)
      .returning();
    return UserEntity.fromRaw(rawUser);
  }
}