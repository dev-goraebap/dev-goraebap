# 변경 사항

이 프로젝트의 모든 주목할 만한 변경 사항이 이 파일에 문서화됩니다.

## [0.8.5] - 2025-01-27

### 추가됨
- **SEO 최적화 시스템**: 검색엔진 최적화를 위한 포괄적인 SEO 기능 구현
  - `robots.txt` 동적 제공 (`/robots.txt` 경로로 접근 가능)
  - `sitemap.xml` 자동 생성 (모든 발행된 게시글과 주요 페이지 포함)
  - **메타 태그 최적화**: Open Graph, Twitter Card, Canonical URL 지원
  - **이미지 SEO**: 모든 썸네일 이미지에 의미있는 alt 태그 적용

- **SEO 모듈**: SEO 관련 기능을 전담하는 새로운 모듈 추가
  - `SeoModule`: SEO 기능들을 모듈화하여 관리
  - `SitemapController`: sitemap.xml과 robots.txt 동적 제공
  - `PostsSharedService.getPublishedPosts()`: 발행된 게시글 조회 메서드

- **뷰 헬퍼 함수**: SEO를 위한 새로운 헬퍼 함수 추가
  - `originalUrlHelper`: 현재 페이지의 완전한 URL 생성 (프로토콜 포함)
  - 프로토콜, 호스트 자동 감지로 개발/프로덕션 환경 호환

### 변경됨
- **메타 태그 시스템**: 레이아웃 템플릿에 포괄적인 메타 태그 추가
  - Canonical URL: 중복 콘텐츠 방지
  - Open Graph: Facebook, 카카오톡 등 소셜 미디어 링크 미리보기 최적화
  - Twitter Card: Twitter 링크 공유 최적화 (동적 카드 타입 지원)

- **이미지 컴포넌트**: 모든 이미지에 alt 태그 적용
  - 게시글 썸네일: `"게시글 제목 - 썸네일"` 형식
  - 시리즈 썸네일: `"시리즈명 시리즈 - 썸네일"` 형식
  - 접근성 향상 및 검색엔진 최적화

- **동적 메타데이터**: 페이지별 맞춤형 메타데이터 지원
  - 게시글 페이지: 제목, 요약, 썸네일 이미지 자동 설정
  - 시리즈 페이지: 시리즈명, 설명, 썸네일 자동 설정
  - Twitter Card 타입 동적 선택 (summary/summary_large_image)

### SEO 효과
- **검색엔진**: Google, Naver 등에서 빠른 인덱싱 및 순위 향상
- **소셜 미디어**: 링크 공유 시 풍부한 미리보기 카드 표시
- **웹 접근성**: 스크린 리더 지원으로 접근성 표준 준수
- **중복 콘텐츠 방지**: Canonical URL로 SEO 점수 분산 방지