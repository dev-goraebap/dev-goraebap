import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Not, Repository } from 'typeorm';

import { PostEntity, SeriesEntity, SeriesPostEntity, UserEntity } from 'src/core/infrastructure/entities';
import { UpdatePublishDto } from '../../_concern';
import { CreateSeriesDto, UpdateSeriesDto } from '../dto/create-or-update-series.dto';

@Injectable()
export class SeriesService {
  constructor(
    @InjectRepository(SeriesEntity)
    private readonly seriesRepository: Repository<SeriesEntity>,
    @InjectRepository(SeriesPostEntity)
    private readonly seriesPostRepository: Repository<SeriesPostEntity>,
  ) { }

  async findById(id: number): Promise<SeriesEntity | null> {
    return this.seriesRepository.findOne({ where: { id } });
  }

  async findPostRelation(seriesId: number, postId: number): Promise<SeriesPostEntity | null> {
    return await this.seriesPostRepository.findOne({
      where: {
        series: { id: seriesId },
        post: { id: postId },
      },
    });
  }

  async validateSeriesNameUniqueness(name: string, excludeSeriesId?: number): Promise<void> {
    const whereCondition: any = { name };

    if (excludeSeriesId) {
      whereCondition.id = Not(excludeSeriesId);
    }

    const existingSeries = await this.seriesRepository.findOne({ where: whereCondition });

    if (existingSeries) {
      throw new BadRequestException('이미 사용중인 시리즈 이름입니다.');
    }
  }

  async createSeries(user: UserEntity, dto: CreateSeriesDto, manager: EntityManager): Promise<SeriesEntity> {
    const newSeries = this.seriesRepository.create({ user, ...dto });
    return await manager.save(newSeries);
  }

  async updateSeries(series: SeriesEntity, dto: UpdateSeriesDto, manager: EntityManager): Promise<SeriesEntity> {
    const updatedSeries = this.seriesRepository.create({ ...series, ...dto });
    return await manager.save(updatedSeries);
  }

  async updatePublish(id: number, dto: UpdatePublishDto): Promise<void> {
    const series = await this.seriesRepository.findOne({ where: { id } });
    if (!series) {
      throw new BadRequestException('시리즈를 찾을 수 없습니다.');
    }
    const updatedSeries = this.seriesRepository.create({
      ...series,
      isPublishedYn: dto.isPublishedYn,
    });
    await this.seriesRepository.save(updatedSeries);
  }

  async createRelation(series: SeriesEntity, post: PostEntity): Promise<void> {
    const newRelation = this.seriesPostRepository.create({ series, post });
    await this.seriesPostRepository.save(newRelation);
  }

  async removeRelation(postRelation: SeriesPostEntity): Promise<void> {
    await this.seriesPostRepository.remove(postRelation);
  }
}