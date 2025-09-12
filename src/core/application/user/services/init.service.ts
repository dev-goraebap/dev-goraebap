import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserEntity } from 'src/core/infrastructure/entities';

@Injectable()
export class InitService implements OnModuleInit {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async onModuleInit() {
    const adminEmail = this.configService.get('ADMIN_USERNAME');
    const user = await this.userRepository.findOne({
      where: {
        email: adminEmail,
      },
    });
    if (user) {
      return;
    }
    const newUser = this.userRepository.create({
      email: adminEmail,
      nickname: 'dev.goraebap',
    });
    await this.userRepository.save(newUser);
  }
}
