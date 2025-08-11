import { Injectable, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "src/shared";
import { Repository } from "typeorm";

@Injectable()
export class AppService implements OnModuleInit {

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>
  ) {}

  async onModuleInit() {
    const username = this.configService.get('ADMIN_USERNAME');
    const hasUser = await this.userRepository.exists({
      where: {
        email: username
      }
    });
    if (hasUser) {
      return;
    }

    const newUser = this.userRepository.create({
      email: username,
      nickname: 'dev.goraebap',
    })
    await this.userRepository.save(newUser);
  }
}