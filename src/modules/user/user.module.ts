import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { AdminAuthGuard } from './application/guards/admin-auth.guard';
import { InitService } from './application/services/init.service';
import { UserAuthService } from './application/services/user-auth.service';
import { UserQueryService } from './application/services/user-query.service';
import { UserSessionService } from './application/services/user-session.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '5m' },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    UserAuthService,
    UserQueryService,
    UserSessionService,
    AdminAuthGuard,
    InitService,
  ],
  exports: [
    UserAuthService,
    UserQueryService,
    UserSessionService,
    AdminAuthGuard,
  ],
})
export class UserModule {}