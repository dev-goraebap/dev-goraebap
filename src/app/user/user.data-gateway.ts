import { eq } from "drizzle-orm";

import { DrizzleContext, InsertUser, SelectUser, users } from "src/shared/drizzle";
import { UserEntity } from "./user.entity";

export class UserDataGateway {
  async findByEmail(email: string): Promise<SelectUser | null> {
    const result = await DrizzleContext.db()
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return result.length > 0 ? UserEntity.fromRaw(result[0]) : null;
  }

  async create(data: InsertUser): Promise<SelectUser> {
    const [rawUser] = await DrizzleContext.db()
      .insert(users)
      .values(data)
      .returning();
    return UserEntity.fromRaw(rawUser);
  }
}