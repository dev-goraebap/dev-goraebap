import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { UserAuthService } from './application/services/user-auth.service';
import { UserQueryService } from './application/services/user-query.service';
import { UserSessionService } from './application/services/user-session.service';
import { AdminAuthGuard } from './application/guards/admin-auth.guard';

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
  ],
  exports: [
    UserAuthService,
    UserQueryService,
    UserSessionService,
    AdminAuthGuard,
  ],
})
export class UserModule {}