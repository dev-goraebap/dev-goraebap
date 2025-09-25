import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { eq } from 'drizzle-orm';

import { DRIZZLE, DrizzleOrm, users } from 'src/shared/drizzle';
import { LoggerService } from 'src/shared/logger';

@Injectable()
export class AdminCreationService implements OnModuleInit {
  constructor(
    @Inject(DRIZZLE)
    private readonly drizzle: DrizzleOrm,
    private readonly configService: ConfigService,
    private readonly logger: LoggerService
  ) { }

  async onModuleInit() {
    const adminEmail = this.configService.get('ADMIN_USERNAME');
    const user = await this.drizzle.query.users.findFirst({
      where: eq(users.email, adminEmail)
    });
    if (user) {
      this.logger.info('Exist admin User');
      return;
    }

    try {
      await this.drizzle.insert(users).values({
        email: adminEmail,
        nickname: 'dev.goraebap'
      });
      this.logger.info('Init admin User');
    } catch (err) {
      this.logger.error(err);
    }
  }
}
