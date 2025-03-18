# syntax=docker/dockerfile:1
# check=error=true

# 이 Dockerfile은 프로덕션 환경을 위한 예시입니다.
ARG RUBY_VERSION=3.3.4
FROM docker.io/library/ruby:$RUBY_VERSION-slim AS base

WORKDIR /rails

RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y curl libjemalloc2 libvips sqlite3 && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives

ENV RAILS_ENV="production" \
    BUNDLE_DEPLOYMENT="1" \
    BUNDLE_PATH="/usr/local/bundle" \
    BUNDLE_WITHOUT="development"

# --------------------------------------------------
# 빌드 스테이지
# --------------------------------------------------
FROM base AS build

RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential git pkg-config \
    curl gnupg lsb-release ca-certificates && \
    # Add NodeSource repository
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g yarn && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives

# ★ Bun 대신 Node로 Tailwind 컴파일을 강제
ENV TAILWINDCSS_RUBY_JS_RUNTIME=node

COPY Gemfile Gemfile.lock ./

RUN bundle install && \
    rm -rf ~/.bundle/ "${BUNDLE_PATH}"/ruby/*/cache "${BUNDLE_PATH}"/ruby/*/bundler/gems/*/.git && \
    bundle exec bootsnap precompile --gemfile

COPY . .

RUN if [ -f yarn.lock ]; then \
      yarn install; \
    elif [ -f package-lock.json ]; then \
      npm ci; \
    fi

RUN bundle exec bootsnap precompile app/ lib/

# 여기서 SECRET_KEY_BASE는 임시값으로, 실제로는 빌드시 환경 변수나 CI/CD에서 주입
RUN SECRET_KEY_BASE=dummykeythatis32byteslongatleast bin/rails assets:precompile

# --------------------------------------------------
# 최종 이미지 스테이지
# --------------------------------------------------
FROM base

RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y curl && \
    # Add NodeSource repository the simplified way
    curl -fsSL https://deb.nodesource.com/setup_lts.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives

COPY --from=build "${BUNDLE_PATH}" "${BUNDLE_PATH}"
COPY --from=build /rails /rails

RUN groupadd --system --gid 1000 rails && \
    useradd rails --uid 1000 --gid 1000 --create-home --shell /bin/bash && \
    chown -R rails:rails db log storage tmp
USER 1000:1000

ENTRYPOINT ["/rails/bin/docker-entrypoint"]

EXPOSE 80
CMD ["./bin/thrust", "./bin/rails", "server"]
