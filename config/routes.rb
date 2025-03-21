Rails.application.routes.draw do
  root to: "feed#index"

  get "up" => "rails/health#show", as: :rails_health_check

  resources :posts, only: [ :index, :show, :new ]
  resources :projects, only: [ :index, :show ]

  namespace :admin do
    root to: "dashboard#index" # Admin 대시보드 (선택 사항)
    resources :members, only: [ :index ]
    resources :projects, only: [ :index ]
    resources :posts, only: [ :index ]
  end
end
