import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Not, Repository } from 'typeorm';

import {
  AttachmentQueryHelper,
  PostEntity,
  SeriesEntity,
  SeriesPostEntity,
  UpdatePublishDto,
  UserEntity,
} from 'src/shared';
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

    // 시리즈 상태 필터링
    if (dto.status) {
      // 기본값이 'post'이므로 다른 값일 때만 조건 추가
      qb.andWhere('series.status = :status', {
        status: dto.status,
      });
    }

    // 발행 상태 필터링
    if (dto.isPublishedYn) {
      // 빈 문자열이 아닐 때만 조건 추가
      qb.andWhere('series.isPublishedYn = :isPublishedYn', {
        isPublishedYn: dto.isPublishedYn,
      });
    }

    qb.orderBy(`series.${dto.orderKey}`, dto.orderBy);

    // 페이지네이션 추가
    const offset = (dto.page - 1) * dto.perPage;
    qb.skip(offset).take(dto.perPage);

    // 결과 반환 (총 개수와 함께)
    const [seriesList, total] = await qb.getManyAndCount();

    return {
      seriesList,
      pagination: {
        page: dto.page,
        perPage: dto.perPage,
        total,
        totalPages: Math.ceil(total / dto.perPage),
      },
    };
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

  async updatePublish(id: number, dto: UpdatePublishDto) {
    const series = await this.seriesRepository.findOne({
      where: {
        id,
      },
    });
    if (!series) {
      throw new BadRequestException('시리즈를 찾을 수 없습니다.');
    }
    const updatedSeries = this.seriesRepository.create({
      ...series,
      isPublishedYn: dto.isPublishedYn,
    });
    await this.seriesRepository.save(updatedSeries);
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
