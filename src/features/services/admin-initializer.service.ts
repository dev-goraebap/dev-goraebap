import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { UserEntity } from "src/domain/user";
import { LoggerService } from "src/shared/logger";

@Injectable()
export class AdminInitializerService {

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) { }

  async create() {
    try {
      this.logger.info('Starting admin initialization...');

      const adminEmail = this.configService.get('ADMIN_USERNAME') as string;

      // 환경변수 검증
      if (!adminEmail) {
        this.logger.warn('ADMIN_USERNAME environment variable is not set. Skipping admin initialization.');
        return;
      }

      this.logger.info(`Checking if admin user exists: ${adminEmail}`);
      const exists = await UserEntity.existsByEmail(adminEmail);
      if (exists) {
        this.logger.info(`Admin user already exists: ${adminEmail}`);
        return;
      }

      this.logger.info(`Creating new admin user: ${adminEmail}`);
      await UserEntity.create({
        email: adminEmail,
        nickname: 'dev.goraebap'
      });
      this.logger.info(`Admin user created successfully: ${adminEmail}`);

    } catch (error) {
      this.logger.error('Failed to initialize admin user:', error);
      throw error;
    }
  }
}