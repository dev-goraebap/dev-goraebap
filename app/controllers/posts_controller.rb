class PostsController < ApplicationController
  def index
    @posts = [
      {
        id: 1,
        thumbnail: helpers.asset_path("82f9bd232efb25e7b9b35e69c6b8a838.jpg"),
        title: "Ruby on Rails 8: 혁신적인 변화와 성능 개선",
        summary: "Rails 8의 새로운 기능과 성능 최적화에 대해 알아봅니다. 비동기 처리, 향상된 Hotwire 통합, 그리고 개발자 경험을 크게 개선한 변경사항들을 살펴보세요.",
        created_at: "2025-03-10",
        tags: [
          { id: 1, text_color: "--color-red-600", name: "Ruby" },
          { id: 2, text_color: "--color-pink-600", name: "Rails 8" },
          { id: 3, text_color: "--color-purple-600", name: "Web Development" }
        ]
      },
      {
        id: 2,
        thumbnail: helpers.asset_path("82f9bd232efb25e7b9b35e69c6b8a838.jpg"),
        title: "Angular 17: 선언적 UI와 새로운 렌더링 엔진",
        summary: "Angular 17의 핵심 기능인 선언적 UI 패턴과 강력해진 렌더링 엔진에 대해 심층적으로 분석합니다. 프로젝트 성능을 크게 향상시키는 방법을 배워보세요.",
        created_at: "2025-02-25",
        tags: [
          { id: 4, text_color: "--color-red-600", name: "Angular" },
          { id: 5, text_color: "--color-blue-600", name: "TypeScript" },
          { id: 6, text_color: "--color-green-600", name: "Frontend" }
        ]
      },
      {
        id: 3,
        thumbnail: helpers.asset_path("82f9bd232efb25e7b9b35e69c6b8a838.jpg"),
        title: "NestJS로 구축하는 엔터프라이즈급 백엔드 아키텍처",
        summary: "TypeScript 기반의 NestJS 프레임워크를 활용하여 확장 가능하고 유지보수가 용이한 백엔드 시스템을 설계하는 방법을 알아봅니다. 의존성 주입, 모듈화 아키텍처의 장점을 살펴봅니다.",
        created_at: "2025-02-15",
        tags: [
          { id: 7, text_color: "--color-red-600", name: "NestJS" },
          { id: 8, text_color: "--color-blue-600", name: "TypeScript" },
          { id: 9, text_color: "--color-green-600", name: "Backend" }
        ]
      },
      {
        id: 4,
        thumbnail: helpers.asset_path("82f9bd232efb25e7b9b35e69c6b8a838.jpg"),
        title: "웹 컴포넌트: 프레임워크에 의존하지 않는 UI 개발의 미래",
        summary: "브라우저 네이티브 웹 컴포넌트를 활용하여 프레임워크에 종속되지 않는 재사용 가능한 UI 컴포넌트를 개발하는 방법과 그 장점에 대해 탐구합니다. Shadow DOM과 Custom Elements의 강력함을 경험해보세요.",
        created_at: "2025-02-10",
        tags: [
          { id: 10, text_color: "--color-yellow-600", name: "Web Components" },
          { id: 11, text_color: "--color-purple-600", name: "JavaScript" },
          { id: 12, text_color: "--color-blue-600", name: "HTML" }
        ]
      },
      {
        id: 5,
        thumbnail: helpers.asset_path("82f9bd232efb25e7b9b35e69c6b8a838.jpg"),
        title: "Flutter 4.0: 크로스 플랫폼 앱 개발의 새로운 지평",
        summary: "Google의 Flutter 4.0 릴리즈와 함께 도입된 혁신적인 기능들을 소개합니다. 향상된 웹 지원, 새로운 Material 3 디자인 시스템 구현, 그리고 성능 최적화 기법을 알아봅니다.",
        created_at: "2025-01-30",
        tags: [
          { id: 13, text_color: "--color-blue-600", name: "Flutter" },
          { id: 14, text_color: "--color-yellow-600", name: "Dart" },
          { id: 15, text_color: "--color-green-600", name: "Mobile" }
        ]
      },
      {
        id: 6,
        thumbnail: helpers.asset_path("82f9bd232efb25e7b9b35e69c6b8a838.jpg"),
        title: "Turso로 엔터프라이즈 환경에 SQLite 도입하기",
        summary: "분산 SQLite 데이터베이스인 Turso를 활용하여 기업 환경에서 고성능, 저지연 데이터 솔루션을 구축하는 방법을 소개합니다. Edge 컴퓨팅 시대에 적합한 데이터베이스 전략을 배워보세요.",
        created_at: "2025-01-20",
        tags: [
          { id: 16, text_color: "--color-blue-600", name: "Turso" },
          { id: 17, text_color: "--color-green-600", name: "SQLite" },
          { id: 18, text_color: "--color-purple-600", name: "Database" }
        ]
      },
      {
        id: 7,
        thumbnail: helpers.asset_path("82f9bd232efb25e7b9b35e69c6b8a838.jpg"),
        title: "Docker와 Kubernetes로 마이크로서비스 배포하기",
        summary: "컨테이너 오케스트레이션을 통한 확장 가능한 인프라 구축의 기초와 실제 적용 사례를 살펴봅니다. Docker는 애플리케이션을 패키징하는 강력한 도구입니다.",
        created_at: "2025-01-15",
        tags: [
          { id: 19, text_color: "--color-blue-600", name: "Docker" },
          { id: 20, text_color: "--color-blue-600", name: "Kubernetes" },
          { id: 21, text_color: "--color-gray-600", name: "DevOps" }
        ]
      },
      {
        id: 8,
        thumbnail: helpers.asset_path("82f9bd232efb25e7b9b35e69c6b8a838.jpg"),
        title: "Rust와 WebAssembly로 고성능 웹 애플리케이션 구축하기",
        summary: "Rust 언어와 WebAssembly를 결합하여 브라우저에서 네이티브에 가까운 성능을 내는 웹 애플리케이션을 개발하는 방법을 소개합니다. 복잡한 계산과 게임 개발에 최적화된 접근법을 알아보세요.",
        created_at: "2025-01-05",
        tags: [
          { id: 22, text_color: "--color-orange-600", name: "Rust" },
          { id: 23, text_color: "--color-purple-600", name: "WebAssembly" },
          { id: 24, text_color: "--color-yellow-600", name: "Performance" }
        ]
      },
      {
        id: 9,
        thumbnail: helpers.asset_path("82f9bd232efb25e7b9b35e69c6b8a838.jpg"),
        title: "GraphQL과 Apollo로 효율적인 API 설계하기",
        summary: "REST를 넘어선 GraphQL의 장점과 Apollo 클라이언트/서버를 활용한 최적화된 데이터 페칭 전략을 배워봅니다. 오버페칭과 언더페칭 문제를 해결하는 현대적인 API 설계 방법론을 탐구합니다.",
        created_at: "2024-12-20",
        tags: [
          { id: 25, text_color: "--color-pink-600", name: "GraphQL" },
          { id: 26, text_color: "--color-purple-600", name: "Apollo" },
          { id: 27, text_color: "--color-blue-600", name: "API" }
        ]
      },
      {
        id: 10,
        thumbnail: helpers.asset_path("82f9bd232efb25e7b9b35e69c6b8a838.jpg"),
        title: "머신러닝 모델을 웹 애플리케이션에 통합하는 실용적인 방법",
        summary: "TensorFlow.js와 ONNX 런타임을 활용하여 사전 훈련된 머신러닝 모델을 웹 애플리케이션에 효과적으로 통합하는 방법을 알아봅니다. 브라우저에서 직접 실행되는 AI 기능 구현 전략을 소개합니다.",
        created_at: "2024-12-10",
        tags: [
          { id: 28, text_color: "--color-green-600", name: "Machine Learning" },
          { id: 29, text_color: "--color-blue-600", name: "TensorFlow.js" },
          { id: 30, text_color: "--color-red-600", name: "AI" }
        ]
      }
    ]
  end

  def show
  end

  def new
    @post = Post.new
  end
end
