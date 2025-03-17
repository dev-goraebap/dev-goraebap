class FeedController < ApplicationController
  include ActionView::Helpers::AssetUrlHelper  # 에셋 URL 헬퍼 포함

  def index
    @projects = [
      {
        id: 1,
        main_image: "fdb8eb6c65fa9ddf7d4b4ba82a500fd2.jpg",
        left_image: "avatar.jpg",
        right_image: "f212e61f1e3baa18d35a2959fcdd9a92.jpg",
        title: "계란 간장 볶음밥",
        tags: [
          { bg: "bg-purple-100", text: "text-purple-600", name: "Ruby on Rails" },
          { bg: "bg-blue-100", text: "text-blue-600", name: "후라이팬 프레임웤" }
        ],
        description: "기름 한큰술 넣고 어느정도 달군 오목한 후라이팬을 ... (생략)",
        features: [ "맛있어보이는 사용자 UI", "적은 재료 리소스", "초보자도 쉽게 만들 수 있음" ],
        link: "/projects/1"
      },
      {
        id: 2,
        main_image: "avatar.jpg",
        left_image: "f212e61f1e3baa18d35a2959fcdd9a92.jpg",
        right_image: "fdb8eb6c65fa9ddf7d4b4ba82a500fd2.jpg",
        title: "크래프톤 클론 프로젝트",
        tags: [
          { bg: "bg-green-100", text: "text-green-600", name: "React" },
          { bg: "bg-yellow-100", text: "text-yellow-600", name: "TypeScript" }
        ],
        description: "크래프톤은 글로벌 게임 개발사로서 ... (생략)",
        features: [ "반응형 UI/UX", "실시간 데이터 처리", "고성능 모바일 최적화" ],
        link: "/projects/2"
      },
      {
        id: 3,
        main_image: "f212e61f1e3baa18d35a2959fcdd9a92.jpg",
        left_image: "fdb8eb6c65fa9ddf7d4b4ba82a500fd2.jpg",
        right_image: "avatar.jpg",
        title: "AI 기반 분석 대시보드",
        tags: [
          { bg: "bg-blue-100", text: "text-blue-600", name: "Python" },
          { bg: "bg-indigo-100", text: "text-indigo-600", name: "TensorFlow" }
        ],
        description: "머신러닝 알고리즘을 활용한 데이터 분석 및 예측 모델 ... (생략)",
        features: [ "실시간 데이터 시각화", "예측 모델링", "커스텀 레포트 생성" ],
        link: "/projects/3"
      }
    ]
  end
end
