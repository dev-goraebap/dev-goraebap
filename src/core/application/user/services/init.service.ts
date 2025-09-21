import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { eq } from 'drizzle-orm';

import { LoggerService } from 'src/shared';
import { DRIZZLE, DrizzleOrm, users } from 'src/shared/drizzle';

@Injectable()
export class InitService implements OnModuleInit {
  constructor(
    private readonly configService: ConfigService,
    @Inject(DRIZZLE)
    private readonly drizzle: DrizzleOrm,
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
