import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { AdminAuthGuard } from 'src/common';
import { AuthService } from './auth.service';
import { SessionController } from './session.controller';

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
  controllers: [SessionController],
  providers: [AuthService, AdminAuthGuard],
  exports: [AdminAuthGuard],
})
export class SessionModule {}