import { BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";

import { PostEntity, SeriesEntity, SeriesPostEntity } from "src/core/infrastructure/entities";

export class SeriesPostCommandService {

  constructor(
    @InjectRepository(SeriesEntity)
    private readonly seriesRepository: Repository<SeriesEntity>,
    @InjectRepository(SeriesPostEntity)
    private readonly seriesPostRepository: Repository<SeriesPostEntity>,
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,
  ) { }

  async create(seriesId: number, postId: number) {
    const series = await this.seriesRepository.findOne({
      where: {
        id: seriesId,
      },
    });
    if (!series) {
      throw new BadRequestException('시리즈를 찾을 수 없습니다.');
    }

    const post = await this.postRepository.findOne({
      where: {
        id: postId,
      },
    });
    if (!post) {
      throw new BadRequestException('게시물을 찾을 수 없습니다.');
    }

    const newSeriesPost = this.seriesPostRepository.create({
      series,
      post,
    });
    await this.seriesPostRepository.save(newSeriesPost);
  }

  async updateOrders(idAndOrders: { id: number; order: number }[]) {
    const idAndOrderMap = new Map(idAndOrders.map(({ id, order }) => [id, order]));
    const ids = Array.from(idAndOrderMap.keys());

    console.log(ids);

    const seriesPosts = await this.seriesPostRepository.find({
      where: { id: In(ids) },
    });

    const updated = seriesPosts.map((seriesPost) =>
      this.seriesPostRepository.create({
        ...seriesPost,
        order: idAndOrderMap.get(seriesPost.id) ?? 0,
      }),
    );

    await this.seriesPostRepository.save(updated);
  }

  async destroy(seriesId: number, postId: number) {
    const seriesPost = await this.seriesPostRepository.findOne({
      where: {
        series: {
          id: seriesId,
        },
        post: {
          id: postId,
        },
      },
    });
    if (!seriesPost) {
      throw new BadRequestException('시리즈의 게시물을 찾을 수 없습니다.');
    }
    await this.seriesPostRepository.remove(seriesPost);
  }
}