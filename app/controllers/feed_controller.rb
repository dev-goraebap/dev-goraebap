class FeedController < ApplicationController
  def index
    @projects = [
      {
        id: 1,
        thumbnail: helpers.asset_path("fdb8eb6c65fa9ddf7d4b4ba82a500fd2.jpg"),
        title: "계란 간장 볶음밥",
        tags: [
          { bg_color: "--color-purple-100", text_color: "--color-purple-600", name: "Ruby on Rails" },
          { bg_color: "--color-blue-100", text_color: "--color-blue-600", name: "후라이팬 프레임웤" }
        ],
        description: "기름 한큰술 넣고 어느정도 달군 오목한 후라이팬을 ... (생략)",
        features: [ "맛있어보이는 사용자 UI", "적은 재료 리소스", "초보자도 쉽게 만들 수 있음" ]
      },
      {
        id: 2,
        thumbnail: helpers.asset_path("avatar.jpg"),
        title: "크래프톤 클론 프로젝트",
        tags: [
          { bg_color: "--color-green-100", text_color: "--color-green-600", name: "React" },
          { bg_color: "--color-yellow-100", text_color: "--color-yellow-600", name: "TypeScript" }
        ],
        description: "크래프톤은 글로벌 게임 개발사로서 ... (생략)",
        features: [ "반응형 UI/UX", "실시간 데이터 처리", "고성능 모바일 최적화" ]
      },
      {
        id: 3,
        thumbnail: helpers.asset_path("f212e61f1e3baa18d35a2959fcdd9a92.jpg"),
        title: "AI 기반 분석 대시보드",
        tags: [
          { bg_color: "--color-blue-100", text_color: "--color-blue-600", name: "Python" },
          { bg_color: "--color-indigo-100", text_color: "--color-indigo-600", name: "TensorFlow" }
        ],
        description: "머신러닝 알고리즘을 활용한 데이터 분석 및 예측 모델 ... (생략)",
        features: [ "실시간 데이터 시각화", "예측 모델링", "커스텀 레포트 생성" ]
      }
    ]
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
      }
    ]
  end
end
