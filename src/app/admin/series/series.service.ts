import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Not, Repository } from 'typeorm';

import { AttachmentQueryHelper, PostEntity, SeriesEntity, SeriesPostEntity, UserEntity } from 'src/shared';
import { CreateSeriesDto, UpdateSeriesDto } from './dto/create-or-update-series.dto';
import { GetSeriesDto } from './dto/get-series.dto';

@Injectable()
export class SeriesService {
  constructor(
    @InjectRepository(SeriesEntity)
    private readonly seriesRepository: Repository<SeriesEntity>,
    @InjectRepository(SeriesPostEntity)
    private readonly seriesPostRepository: Repository<SeriesPostEntity>,
  ) {}

  async findById(id: number) {
    return this.seriesRepository.findOne({ where: { id } });
  }

  async findPostRelation(seriesId: number, postId: number) {
    return await this.seriesPostRepository.findOne({
      where: {
        series: {
          id: seriesId,
        },
        post: {
          id: postId,
        },
      },
    });
  }

  async findSeriesList(dto: GetSeriesDto) {
    const qb = this.seriesRepository.createQueryBuilder('series');
    qb.leftJoinAndSelect('series.seriesPosts', 'post');
    AttachmentQueryHelper.withAttachments(qb, 'series');

    if (dto.search) {
      qb.where('series.name LIKE :searchName', {
        searchName: `%${dto.search}%`,
      });
    }

    qb.orderBy(`series.${dto.orderKey}`, dto.orderBy);

    return await qb.getMany();
  }

  async findSeriesItem(id: number) {
    const qb = this.seriesRepository.createQueryBuilder('series');
    qb.leftJoinAndSelect('series.seriesPosts', 'seriesPost');
    qb.leftJoinAndSelect('seriesPost.post', 'post');
    AttachmentQueryHelper.withAttachments(qb, 'series');

    qb.where('series.id = :id', { id });
    qb.orderBy('seriesPost.order', 'ASC');
    qb.addOrderBy('seriesPost.createdAt', 'DESC');
    const series = await qb.getOne();

    if (!series) {
      throw new BadRequestException('시리즈를 찾을 수 없습니다.');
    }

    return series;
  }

  async validateSeriesNameUniqueness(name: string, excludeSeriesId?: number) {
    const whereCondition: any = { name };

    if (excludeSeriesId) {
      whereCondition.id = Not(excludeSeriesId);
    }

    const existingSeries = await this.seriesRepository.findOne({ where: whereCondition });

    if (existingSeries) {
      throw new BadRequestException('이미 사용중인 시리즈 이름입니다.');
    }
  }

  async createSeries(user: UserEntity, dto: CreateSeriesDto, manager: EntityManager) {
    const newSeries = this.seriesRepository.create({ user, ...dto });
    return await manager.save(newSeries);
  }

  async updateSeries(series: SeriesEntity, dto: UpdateSeriesDto, manager: EntityManager) {
    const updatedSeries = this.seriesRepository.create({ ...series, ...dto });
    return await manager.save(updatedSeries);
  }

  async createRelation(series: SeriesEntity, post: PostEntity) {
    const newRelation = this.seriesPostRepository.create({ series, post });
    await this.seriesPostRepository.save(newRelation);
  }

  async updatePostOrders(items: { id: number; order: number }[]) {
    const ids = items.map((item) => item.id);

    const relations = await this.seriesPostRepository.find({
      where: { id: In(ids) },
    });

    const updated = relations.map((relation) => {
      const newOrder = items.find((item) => item.id === relation.id)?.order ?? 999;
      return this.seriesPostRepository.create({ ...relation, order: newOrder });
    });

    await this.seriesPostRepository.save(updated);
  }

  async removeRelation(postRelation: SeriesPostEntity) {
    await this.seriesPostRepository.remove(postRelation);
  }
}
