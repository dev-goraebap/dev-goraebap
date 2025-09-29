import { eq } from "drizzle-orm";
import { DbProvider, InsertUser, SelectUser, users } from "src/shared/drizzle";

export class UserRepository {
  async findByEmail(email: string): Promise<SelectUser | null> {
    const executor = DbProvider.getExecutor();
    const result = await executor
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return result.length > 0 ? result[0] : null;
  }

  async save(data: InsertUser): Promise<SelectUser> {
    const executor = DbProvider.getExecutor();
    const [rawUser] = await executor
      .insert(users)
      .values(data)
      .returning();
    return rawUser;
  }
}