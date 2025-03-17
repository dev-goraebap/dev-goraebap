Rails.application.routes.draw do
  root to: "feed#index"

  get "up" => "rails/health#show", as: :rails_health_check

  resources :posts, only: [ :index, :show, :new ]
  resources :projects, only: [ :index, :show ]
end
