import { BadRequestException, Injectable } from "@nestjs/common";
import { UserRepository } from "./user.repository";

@Injectable()
export class UserService {

  constructor(
    private readonly repository: UserRepository
  ) { }

  async throwIfNotFoundUser(email: string, message?: string) {
    const hasUser = await this.verifyExistsUser(email);
    if (!hasUser) {
      throw new BadRequestException(message || '사용자를 찾을 수 없습니다.');
    }
  }

  async verifyExistsUser(email: string) {
    const exists = await this.repository.findByEmail(email);
    if (exists) {
      return true;
    }
    return false;
  }

  async createAdmin(adminEmail: string) {
    return await this.repository.save({
      email: adminEmail,
      nickname: 'dev.goraebap'
    });
  }
}