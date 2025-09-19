import { Injectable, NotFoundException } from '@nestjs/common';

import { GetAdminPostsDTO, GetFeedPostsDto } from 'src/core/infrastructure/dto';
import { PostEntity } from 'src/core/infrastructure/entities';
import { PostRepository } from 'src/core/infrastructure/repositories';
import { MybatisService } from 'src/shared/mybatis';

@Injectable()
export class PostQueryService {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly mybatisService: MybatisService
  ) { }

  // ---------------------------------------------------------------------------
  // 일반 조회
  // ---------------------------------------------------------------------------

  async getFeedPosts(dto: GetFeedPostsDto) {
    await this.postRepository.findTest();
    return await this.postRepository.findFeedPosts(dto);
  }

  async getLatestPatchNotePost() {
    return await this.postRepository.findLatestPatchNote();
  }

  async getRandomSuggestedPosts(excludeSlug: string) {
    return await this.postRepository.findRandomSuggestedPosts(excludeSlug);
  }

  async getPublishedPostBySlug(slug: string): Promise<PostEntity> {
    const post = await this.postRepository.findPublishedPostBySlug(slug)
    if (!post) {
      throw new NotFoundException('게시물을 찾을 수 없습니다.');
    }
    return post;
  }

  // ---------------------------------------------------------------------------
  // 관리자 기능 조회
  // ---------------------------------------------------------------------------

  async getAdminPosts(dto: GetAdminPostsDTO) {
    return await this.postRepository.findAdminPosts(dto);
  }

  async getAdminPost(id: number): Promise<PostEntity> {
    const post = await this.postRepository.findAdminPost(id);
    if (!post) {
      throw new NotFoundException('게시물을 찾을 수 없습니다.');
    }
    return post;
  }

  async getAdminPostsExcludeSeriesId(seriesId: number, postTitle: string = '') {
    return this.postRepository.findAdminPostsExcludeSeriesId(seriesId, postTitle);
  }
}


