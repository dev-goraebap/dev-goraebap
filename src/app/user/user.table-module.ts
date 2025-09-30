import { BadRequestException } from "@nestjs/common";
import { UserDataGateway } from "./user.data-gateway";

export class UserTableModule {

  constructor(
    private readonly dataGateway: UserDataGateway
  ) { }

  async throwIfNotFoundUser(email: string, message?: string) {
    const hasUser = await this.verifyExistsUser(email);
    if (!hasUser) {
      throw new BadRequestException(message || '사용자를 찾을 수 없습니다.');
    }
  }

  async verifyExistsUser(email: string) {
    const exists = await this.dataGateway.findByEmail(email);
    if (exists) {
      return true;
    }
    return false;
  }

  async createAdmin(adminEmail: string) {
    return await this.dataGateway.create({
      email: adminEmail,
      nickname: 'dev.goraebap'
    });
  }
}