import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { AttachmentQueryHelper, PostEntity, SeriesEntity, UserEntity } from 'src/shared';
import { Repository } from 'typeorm';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,
    @InjectRepository(SeriesEntity)
    private readonly seriesRepository: Repository<SeriesEntity>,
  ) {}

  async getSeries() {
    const qb = this.seriesRepository.createQueryBuilder('series');
    AttachmentQueryHelper.withAttachments(qb, 'series');
    qb.orderBy(`series.createdAt`, 'DESC');
    qb.take(3);
    return await qb.getMany();
  }

  async getPosts() {
    const qb = this.postRepository.createQueryBuilder('post').leftJoinAndSelect('post.tags', 'tag');
    AttachmentQueryHelper.withAttachments(qb, 'post');
    qb.where('post.isPublished = :isPublished', { isPublished: true });
    qb.orderBy(`post.createdAt`, 'DESC');
    qb.take(6);
    return await qb.getMany();
  }

  async onModuleInit() {
    const username = this.configService.get('ADMIN_USERNAME');
    const hasUser = await this.userRepository.exists({
      where: {
        email: username,
      },
    });
    if (hasUser) {
      return;
    }

    const newUser = this.userRepository.create({
      email: username,
      nickname: 'dev.goraebap',
    });
    await this.userRepository.save(newUser);
  }
}
