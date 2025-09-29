import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { LoggerService } from "src/shared/logger";
import { UserService } from "./user.service";

@Injectable()
export class UserApplicationService {

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
    private readonly userService: UserService
  ) { }

  async initAdmin() {
    try {
      this.logger.info('Starting admin initialization...');

      const adminEmail = this.configService.get('ADMIN_USERNAME') as string;

      // 환경변수 검증
      if (!adminEmail) {
        this.logger.warn('ADMIN_USERNAME environment variable is not set. Skipping admin initialization.');
        return;
      }

      this.logger.info(`Checking if admin user exists: ${adminEmail}`);
      const exists = await this.userService.verifyExistsUser(adminEmail);
      if (exists) {
        this.logger.info(`Admin user already exists: ${adminEmail}`);
        return;
      }

      this.logger.info(`Creating new admin user: ${adminEmail}`);
      await this.userService.createAdmin(adminEmail);
      this.logger.info(`Admin user created successfully: ${adminEmail}`);

    } catch (error) {
      this.logger.error('Failed to initialize admin user:', error);
      throw error;
    }
  }
}