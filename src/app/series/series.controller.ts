import { Controller, Get, Param, Req } from '@nestjs/common';
import { NestMvcReq } from 'nestjs-mvc-tools';

@Controller({ path: 'series' })
export class SeriesController {
  @Get()
  index(@Req() req: NestMvcReq) {
    // 목 데이터
    const series = [
      {
        id: 1,
        title: '앵귤러 입문하기',
        description: 'Angular 기초부터 고급까지, 체계적으로 배워보는 프론트엔드 프레임워크',
        image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=600&fit=crop',
        episodes: 12,
        status: '연재중',
        tags: ['Angular', 'TypeScript', 'Frontend']
      },
      {
        id: 2,
        title: 'React 완전정복',
        description: 'Hooks, Context, 상태관리부터 최신 패턴까지 React의 모든 것',
        image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=600&fit=crop',
        episodes: 15,
        status: '완료',
        tags: ['React', 'JavaScript', 'Hooks']
      },
      {
        id: 3,
        title: 'NestJS 마스터하기',
        description: 'Node.js 백엔드 프레임워크의 완벽한 이해와 실전 프로젝트',
        image: 'https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?w=400&h=600&fit=crop',
        episodes: 20,
        status: '연재중',
        tags: ['NestJS', 'Node.js', 'TypeScript']
      },
      {
        id: 4,
        title: 'Docker & Kubernetes',
        description: '컨테이너 기술부터 오케스트레이션까지, DevOps의 핵심 기술 스택',
        image: 'https://images.unsplash.com/photo-1605745341112-85968b19335b?w=400&h=600&fit=crop',
        episodes: 18,
        status: '준비중',
        tags: ['Docker', 'Kubernetes', 'DevOps']
      },
      {
        id: 5,
        title: 'Vue.js 3 완전가이드',
        description: 'Composition API부터 Pinia, Nuxt까지 Vue 생태계 전반',
        image: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=600&fit=crop',
        episodes: 14,
        status: '완료',
        tags: ['Vue.js', 'JavaScript', 'Nuxt']
      },
      {
        id: 6,
        title: 'Python 웹 개발',
        description: 'Django와 FastAPI로 배우는 파이썬 웹 개발의 모든 것',
        image: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&h=600&fit=crop',
        episodes: 16,
        status: '연재중',
        tags: ['Python', 'Django', 'FastAPI']
      }
    ];

    return req.view.render('pages/series/index', {
      series
    });
  }

  @Get(':id')
  show(@Param('id') id: string, @Req() req: NestMvcReq) {
    // 시리즈 목 데이터 (위와 동일)
    const allSeries = [
      {
        id: 1,
        title: '앵귤러 입문하기',
        description: 'Angular 기초부터 고급까지, 체계적으로 배워보는 프론트엔드 프레임워크. TypeScript와 RxJS를 활용한 현대적인 웹 애플리케이션 개발 방법을 학습합니다.',
        image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop',
        episodes: 12,
        status: '연재중',
        tags: ['Angular', 'TypeScript', 'Frontend']
      },
      {
        id: 2,
        title: 'React 완전정복',
        description: 'Hooks, Context, 상태관리부터 최신 패턴까지 React의 모든 것. 실무에서 바로 활용할 수 있는 패턴들과 최적화 기법을 다룹니다.',
        image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop',
        episodes: 15,
        status: '완료',
        tags: ['React', 'JavaScript', 'Hooks']
      },
      {
        id: 3,
        title: 'NestJS 마스터하기',
        description: 'Node.js 백엔드 프레임워크의 완벽한 이해와 실전 프로젝트. 마이크로서비스 아키텍처부터 테스팅까지 포괄적으로 다룹니다.',
        image: 'https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?w=800&h=400&fit=crop',
        episodes: 20,
        status: '연재중',
        tags: ['NestJS', 'Node.js', 'TypeScript']
      }
    ];

    // 시리즈 포스트 목 데이터
    const seriesPosts = [
      {
        id: 1,
        title: 'Angular 개발환경 설정하기',
        content: 'Angular CLI를 활용한 프로젝트 초기 설정과 개발 환경 구축 방법을 알아봅시다.',
        date: '2025년 8월 13일',
        tag: 'Angular',
        tagColor: 'primary',
        views: 1234,
        thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=300&fit=crop',
        episode: 1
      },
      {
        id: 2,
        title: 'Angular 컴포넌트 기초',
        content: '컴포넌트의 생성, 속성 바인딩, 이벤트 처리 등 기본적인 컴포넌트 활용법을 배워봅시다.',
        date: '2025년 8월 12일',
        tag: 'Angular',
        tagColor: 'primary',
        views: 956,
        thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop',
        episode: 2
      },
      {
        id: 3,
        title: 'Angular 서비스와 의존성 주입',
        content: 'Angular의 핵심 개념인 서비스와 의존성 주입 시스템을 이해하고 활용해봅시다.',
        date: '2025년 8월 11일',
        tag: 'Angular',
        tagColor: 'primary',
        views: 743,
        thumbnail: 'https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?w=400&h=300&fit=crop',
        episode: 3
      },
      {
        id: 4,
        title: 'Angular 라우팅 시스템',
        content: 'SPA에서 필수적인 라우팅 시스템 구축과 가드, 리졸버 활용법을 학습합니다.',
        date: '2025년 8월 10일',
        tag: 'Angular',
        tagColor: 'primary',
        views: 892,
        thumbnail: 'https://images.unsplash.com/photo-1605745341112-85968b19335b?w=400&h=300&fit=crop',
        episode: 4
      },
      {
        id: 5,
        title: 'Angular Forms 마스터하기',
        content: '템플릿 기반 폼과 리액티브 폼의 차이점과 각각의 활용 시나리오를 알아봅시다.',
        date: '2025년 8월 9일',
        tag: 'Angular',
        tagColor: 'primary',
        views: 654,
        thumbnail: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=300&fit=crop',
        episode: 5
      },
      {
        id: 6,
        title: 'HTTP 클라이언트 활용하기',
        content: 'Angular HTTP 클라이언트를 사용한 REST API 통신과 인터셉터 활용법을 배워봅시다.',
        date: '2025년 8월 8일',
        tag: 'Angular',
        tagColor: 'primary',
        views: 789,
        thumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&h=300&fit=crop',
        episode: 6
      },
      {
        id: 7,
        title: 'RxJS와 반응형 프로그래밍',
        content: 'Observable과 연산자들을 활용한 반응형 프로그래밍 패러다임을 이해해봅시다.',
        date: '2025년 8월 7일',
        tag: 'Angular',
        tagColor: 'primary',
        views: 567,
        thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=300&fit=crop',
        episode: 7
      },
      {
        id: 8,
        title: 'Angular 애니메이션',
        content: '사용자 경험을 향상시키는 다양한 애니메이션 기법과 구현 방법을 알아봅시다.',
        date: '2025년 8월 6일',
        tag: 'Angular',
        tagColor: 'primary',
        views: 432,
        thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop',
        episode: 8
      },
      {
        id: 9,
        title: 'Angular 테스팅 전략',
        content: 'Karma, Jasmine을 활용한 유닛 테스트와 e2e 테스트 작성 방법을 학습합니다.',
        date: '2025년 8월 5일',
        tag: 'Angular',
        tagColor: 'primary',
        views: 321,
        thumbnail: 'https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?w=400&h=300&fit=crop',
        episode: 9
      },
      {
        id: 10,
        title: 'Angular 성능 최적화',
        content: 'OnPush 전략, 트랙바이 함수 등을 활용한 Angular 애플리케이션 성능 향상 기법',
        date: '2025년 8월 4일',
        tag: 'Angular',
        tagColor: 'primary',
        views: 876,
        thumbnail: 'https://images.unsplash.com/photo-1605745341112-85968b19335b?w=400&h=300&fit=crop',
        episode: 10
      }
    ];

    // 해당 ID의 시리즈 찾기 (임시로 1번 시리즈 사용)
    const series = allSeries.find(s => s.id === parseInt(id)) || allSeries[0];
    
    return req.view.render('pages/series/show', {
      series,
      posts: seriesPosts
    });
  }
}
