import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  AttachmentQueryHelper,
  PostEntity,
  TagEntity,
} from 'src/shared';
import { Repository } from 'typeorm';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,
    @InjectRepository(TagEntity)
    private readonly tagRepository: Repository<TagEntity>,
  ) {}

  async getPosts() {
    const qb = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.tags', 'tag')
      // .where('post.isPublished = :isPublished', { isPublished: true });
    
    AttachmentQueryHelper.withAttachments(qb, 'post');
    qb.orderBy('post.publishedAt', 'DESC');
    qb.take(10);
    
    return await qb.getMany();
  }

  async getPopularPosts() {
    const qb = this.postRepository
      .createQueryBuilder('post')
      .where('post.isPublished = :isPublished', { isPublished: true });
    
    qb.orderBy('post.viewCount', 'DESC');
    qb.take(4);
    qb.select(['post.id', 'post.title', 'post.viewCount', 'post.publishedAt']);
    
    return await qb.getMany();
  }

  async getTags() {
    // 간단히 모든 태그 가져오기 (추후 최적화 가능)
    return await this.tagRepository
      .createQueryBuilder('tag')
      .take(8)
      .getMany();
  }

  async getRecentActivities() {
    // 실제로는 별도의 Activity 엔티티나 로그 테이블에서 가져올 수 있지만,
    // 임시로 최근 게시물 기반으로 활동 생성
    const recentPosts = await this.postRepository
      .createQueryBuilder('post')
      .where('post.isPublished = :isPublished', { isPublished: true })
      .orderBy('post.publishedAt', 'DESC')
      .take(3)
      .select(['post.title', 'post.publishedAt'])
      .getMany();

    return recentPosts.map(post => ({
      message: `새 게시물 "${post.title}"이 발행되었습니다`,
      time: this.getTimeAgo(post.publishedAt),
      color: 'success'
    }));
  }

  private getTimeAgo(date: Date): string {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) {
      return `${diffInDays}일 전`;
    } else if (diffInHours > 0) {
      return `${diffInHours}시간 전`;
    } else {
      return '방금 전';
    }
  }
}