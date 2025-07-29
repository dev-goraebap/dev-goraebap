# Resources Directory

이 프로젝트의 프론트엔드 소스코드 폴더는 전통적인 백엔드 기반의 템플릿 엔진(Edge.js)을 사용합니다. 동시에 현대 프론트엔드 개발에 필수적인 Tailwind CSS를 포함한 다양한 에셋들을 관리하는 에셋 파이프라인(Vite)이 구축되어 있죠.

또한, MPA(Multi Page Application) 환경에서 **SPA(Single Page Application)**와 유사한 사용자 경험을 제공하기 위해 **Hotwired 스택(Stimulus, Turbo 등)**이 설정되어 있습니다.

## 파일 구조 및 개발 프로세스

```
프로젝트루트/
├── views/                  # Edge.js 템플릿
│   ├── components/         # 재사용 가능한 Edge.js 컴포넌트
│   │   ├── layout/         # 레이아웃 컴포넌트
│   │   └── uikit/          # UI 킷 컴포넌트
│   └── pages/              # 페이지별 템플릿
├── src/                    # JavaScript (Stimulus 컨트롤러 등)
│   ├── controllers/        # Stimulus 컨트롤러
│   └── tailwind.css        # Tailwind CSS 스타일시트
├── public/
│   └── builds/             # 빌드된 에셋들 (Vite 출력)
└── vite.config.js          # Vite 설정
```

## 🔧 기술 스택 개요

### 백엔드 템플릿 엔진 + 모던 프론트엔드 도구의 하이브리드 접근

이 프로젝트는 다음과 같은 철학을 바탕으로 구성되었습니다:

- **서버 사이드 렌더링**: Edge.js를 통한 쉽고 강력한 템플릿 시스템
- **모던 개발 환경**: Vite를 통한 간단한 에셋 파이프라인 구축
- **사용자 경험 최적화**: Hotwired를 통한 SPA 수준의 인터랙션
- **현대적 디자인**: Tailwind CSS를 통한 유틸리티 퍼스트 스타일링

---

## 📝 Edge.js Templates

**docs** → https://edgejs.dev/docs/introduction

### 주요 문법 예시
```edge
{{-- 변수 출력 --}}
<h1>{{ title }}</h1>

{{-- 조건문 --}}
@if(user.authenticated)
  <p>환영합니다, {{ user.name }}님!</p>
@endif

{{-- 반복문 --}}
@each(item in items)
  <div class="item">{{ item.name }}</div>
@endeach

{{-- 컴포넌트 사용 --}}
@component('components/button', { text: '클릭하세요' })
```

### 프로젝트 적용
- `views/` 폴더에 `.edge` 확장자 파일들 위치
- 레이아웃, 컴포넌트, 페이지별 템플릿 구조화
- 백엔드 데이터와 프론트엔드 UI의 효율적인 연결
 
### Edge.js 컴포넌트 시스템 (views/components/)
Edge.js는 컴포넌트를 **태그로 사용**할 수 있는 강력한 기능을 제공합니다:

<sub>*주의사항: edgejs의 기본 mount 경로의 /components 디렉토리에서 작동합니다.</sub>

#### 컴포넌트 태그 규칙
- 파일명이 태그명이 됨: `modal.edge` → `@modal()`
- 중첩 폴더는 점 표기법: `form/input.edge` → `@form.input()`
- 언더스코어는 camelCase 변환: `tool_tip.edge` → `@toolTip()`

#### 사용 예시
```edge
{{-- 컴포넌트 정의: views/components/card.edge --}}
<div class="bg-white rounded-lg shadow-md p-6">
  <h3 class="text-xl font-semibold mb-4">
    {{{ await $slots.header() }}}
  </h3>
  <div class="text-gray-600">
    {{{ await $slots.main() }}}
  </div>
</div>

{{-- 컴포넌트 사용 --}}
@card()
  @slot('header')
    제품 소개
  @end
  
  @slot('main')
    <p>이것은 재사용 가능한 카드 컴포넌트입니다.</p>
  @end
@end
```

---

## ⚡ Assets Pipeline By Vite

**docs** → https://vite.dev/guide/

## 🎨 Modern UI By Tailwind CSS

**docs** → https://tailwindcss.com/docs

---

## 🚀 SPA UX By Hotwired

**docs** → https://hotwired.dev/