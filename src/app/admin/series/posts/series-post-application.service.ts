import { BadRequestException, Inject } from "@nestjs/common";

import { POST_REPO, PostRepository } from "src/domain/post";
import { SERIES_REPO, SeriesRepository } from "src/domain/series";
import { SERIES_POST_REPO, SeriesPostEntity, SeriesPostRepository } from "src/domain/series-post";

export class SeriesPostApplicationService {

  constructor(
    @Inject(SERIES_REPO)
    private readonly seriesRepository: SeriesRepository,
    @Inject(POST_REPO)
    private readonly postRepository: PostRepository,
    @Inject(SERIES_POST_REPO)
    private readonly seriesPostRepository: SeriesPostRepository,
  ) { }

  async create(seriesId: number, postId: number) {
    // 1. 시리즈 존재 확인
    const seriesItem = await this.seriesRepository.findById(seriesId);
    if (!seriesItem) {
      throw new BadRequestException('시리즈를 찾을 수 없습니다.');
    }

    // 2. 포스트 존재 확인
    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new BadRequestException('게시물을 찾을 수 없습니다.');
    }

    // 3. 중복 확인
    const existing = await this.seriesPostRepository.find(seriesId, postId);
    if (existing) {
      throw new BadRequestException('이미 시리즈에 포함된 게시물입니다.');
    }

    // 4. 관계 생성
    const newSeriesPost = SeriesPostEntity.create({ seriesId, postId });
    await this.seriesPostRepository.save(newSeriesPost);
  }

  async updateOrders(idAndOrders: { id: number; order: number }[]) {
    if (idAndOrders.length === 0) return;

    // 1. 엔티티 조회
    const ids = idAndOrders.map(({ id }) => id);
    const entities = await this.seriesPostRepository.findByIds(ids);

    // 2. 순서 변경
    const updatedEntities = entities.map((entity) => {
      const newOrder = idAndOrders.find(item => item.id === entity.id)?.order ?? entity.order;
      return entity.updateOrder(newOrder);
    });

    // 3. 일괄 저장
    await this.seriesPostRepository.saveMany(updatedEntities);
  }

  async destroy(seriesId: number, postId: number) {
    const seriesPost = await this.seriesPostRepository.find(seriesId, postId);

    if (!seriesPost) {
      throw new BadRequestException('시리즈의 게시물을 찾을 수 없습니다.');
    }

    await this.seriesPostRepository.delete(seriesPost.id);
  }
}