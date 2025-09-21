import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { InitService } from './services/init.service';
import { UserAuthService } from './services/user-auth.service';
import { UserSessionService } from './services/user-session.service';

const services = [
  UserAuthService,
  UserSessionService,
  InitService,
];

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
    ...services
  ],
  exports: [
    ...services
  ],
})
export class UserModule { }