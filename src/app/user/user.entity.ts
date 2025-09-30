import { SelectUser } from "src/shared/drizzle";

export type UserID = number;

export class UserEntity implements SelectUser {
  constructor(
    readonly id: UserID,
    readonly email: string,
    readonly nickname: string,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) { }

  static fromRaw(data: SelectUser) {
    return new UserEntity(
      data.id,
      data.email,
      data.nickname,
      data.createdAt,
      data.updatedAt
    );
  }
}