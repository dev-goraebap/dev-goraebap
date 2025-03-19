class ProjectsController < ApplicationController
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
      }
    ]
  end

  def show
  end
end
