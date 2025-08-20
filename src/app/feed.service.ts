import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AttachmentQueryHelper, PostEntity, TagEntity } from 'src/shared';

@Injectable()
export class FeedService {
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
      .where('post.isPublished = :isPublished', { isPublished: true });

    AttachmentQueryHelper.withAttachments(qb, 'post');
    qb.orderBy('post.publishedAt', 'DESC');
    qb.take(10);

    return await qb.getMany();
  }

  async getTechNews() {
    // 기술 뉴스 목 데이터
    const results = [
      {
        id: 1,
        title: 'Next.js 15 릴리즈: 새로운 기능과 성능 개선',
        summary: 'React 19 지원, 개선된 App Router, 새로운 컴파일러 최적화 등 주요 업데이트가 포함되었습니다.',
        url: 'https://nextjs.org/blog/next-15',
        publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2시간 전
        source: 'Next.js Blog',
      },
      {
        id: 2,
        title: 'TypeScript 5.6 베타 버전 출시',
        summary: '새로운 타입 추론 개선과 성능 최적화, 더 나은 개발자 경험을 제공합니다.',
        url: 'https://devblogs.microsoft.com/typescript',
        publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4시간 전
        source: 'Microsoft DevBlog',
      },
      {
        id: 3,
        title: 'AI 코딩 도구 최신 동향: Claude와 ChatGPT 비교',
        summary: '개발자들이 가장 많이 사용하는 AI 코딩 어시스턴트들의 장단점을 분석합니다.',
        url: 'https://news.hada.io',
        publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6시간 전
        source: 'GeekNews',
      },
      {
        id: 4,
        title: 'Docker Desktop 최신 업데이트',
        summary: '컨테이너 성능 개선과 새로운 개발자 도구가 추가되었습니다.',
        url: 'https://docs.docker.com',
        publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8시간 전
        source: 'Docker Blog',
      },
      {
        id: 5,
        title: 'Bun 1.2: 자바스크립트 런타임의 새로운 이정표',
        summary: 'Node.js보다 빠른 성능과 향상된 호환성을 제공하는 Bun의 최신 업데이트입니다.',
        url: 'https://bun.sh/blog',
        publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12시간 전
        source: 'Bun Blog',
      },
      {
        id: 6,
        title: 'GitHub Copilot X: AI 페어 프로그래밍의 미래',
        summary: 'GPT-4를 기반으로 한 새로운 코딩 어시스턴트 기능들이 소개되었습니다.',
        url: 'https://github.blog',
        publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1일 전
        source: 'GitHub Blog',
      },
    ];
    return Promise.resolve(results);
  }
}
