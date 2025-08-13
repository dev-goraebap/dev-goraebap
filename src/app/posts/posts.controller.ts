import { Controller, Get, Req } from '@nestjs/common';
import { NestMvcReq } from 'nestjs-mvc-tools';

@Controller({ path: 'posts' })
export class PostsController {
  @Get()
  index(@Req() req: NestMvcReq) {
    // 목 데이터
    const posts = [
      {
        id: 1,
        title: 'NestJS에서 MVC 패턴 사용해보기',
        content: 'CSS의 예상치 못한 동작들과 해결 방법들을 알아보자. 실무에서 자주 마주치는 문제들과 해결책을 정리했습니다.',
        date: '2025년 8월 13일',
        tag: 'NestJS',
        tagColor: 'primary',
        views: 1234,
        thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=300&fit=crop'
      },
      {
        id: 2,
        title: 'React 상태 관리 완벽 가이드',
        content: 'useState, useReducer, Context API부터 Zustand, Redux까지 상황별 최적의 상태 관리 방법을 알아봅시다.',
        date: '2025년 8월 12일',
        tag: 'React',
        tagColor: 'info',
        views: 956,
        thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop'
      },
      {
        id: 3,
        title: 'TypeScript 고급 타입 시스템 활용하기',
        content: 'Generic, Conditional Types, Mapped Types 등 TypeScript의 고급 기능들을 실무에 적용하는 방법',
        date: '2025년 8월 11일',
        tag: 'TypeScript',
        tagColor: 'info',
        views: 743,
        thumbnail: 'https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?w=400&h=300&fit=crop'
      },
      {
        id: 4,
        title: 'Docker 컴테이너 최적화 전략',
        content: '이미지 크기 줄이기, 빌드 시간 단축, 보안 강화까지 Docker 컴테이너 최적화의 모든 것',
        date: '2025년 8월 10일',
        tag: 'Docker',
        tagColor: 'accent',
        views: 892,
        thumbnail: 'https://images.unsplash.com/photo-1605745341112-85968b19335b?w=400&h=300&fit=crop'
      }
    ];

    const popularPosts = [
      {
        title: '웹 개발자가 알아야 할 브라우저 최적화 기법',
        views: 2341,
        date: '8월 8일'
      },
      {
        title: 'JavaScript ES2024 새로운 기능들 살펴보기',
        views: 1876,
        date: '8월 5일'
      },
      {
        title: 'API 설계 베스트 프렉티스 정리',
        views: 1654,
        date: '8월 3일'
      },
      {
        title: '개발자를 위한 Git 워크플로우 가이드',
        views: 1432,
        date: '8월 1일'
      }
    ];

    const tags = [
      { name: 'JavaScript', color: 'primary' },
      { name: 'React', color: 'info' },
      { name: 'Node.js', color: 'success' },
      { name: 'TypeScript', color: 'secondary' },
      { name: 'CSS', color: 'warning' },
      { name: 'HTML', color: 'accent' },
      { name: 'Vue.js', color: 'error' },
      { name: 'Python', color: 'neutral' }
    ];

    const activities = [
      {
        message: '새 게시물이 발행되었습니다',
        time: '2시간 전',
        color: 'success'
      },
      {
        message: '댓글 5개가 추가되었습니다',
        time: '4시간 전',
        color: 'info'
      },
      {
        message: '시리즈가 업데이트되었습니다',
        time: '1일 전',
        color: 'secondary'
      }
    ];

    return req.view.render('pages/posts/index', {
      posts,
      popularPosts,
      tags,
      activities
    });
  }
}
