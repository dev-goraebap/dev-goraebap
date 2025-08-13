#!/bin/bash

# package.json에서 버전 읽어오기 (APP_VERSION이 있으면 그걸, 없으면 package.json에서 읽기)
IMAGE_NAME="devgoraebap/my-blog"
VERSION=${APP_VERSION:-$(node -p "require('./package.json').version")}
FULL_IMAGE_NAME="${IMAGE_NAME}:${VERSION}"

echo "🚀 Docker 이미지 빌드 및 푸시 시작..."
echo "📦 이미지명: ${FULL_IMAGE_NAME}"
echo "📋 버전: ${VERSION}"
echo ""

# Docker 빌드
echo "🔨 Docker 이미지 빌드 중..."
if docker build -t ${FULL_IMAGE_NAME} .; then
    echo "✅ 빌드 성공: ${FULL_IMAGE_NAME}"
else
    echo "❌ 빌드 실패!"
    exit 1
fi

# latest 태그도 추가
if [ "${VERSION}" != "latest" ]; then
    echo "🏷️  latest 태그 추가 중..."
    docker tag ${FULL_IMAGE_NAME} ${IMAGE_NAME}:latest
    echo "✅ latest 태그 추가 완료"
fi

echo ""
echo "📤 Docker Hub에 푸시하시겠습니까? (y/N)"
read -r response

if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    echo "📤 Docker Hub에 푸시 중..."
    
    # 버전 태그 푸시
    if docker push ${FULL_IMAGE_NAME}; then
        echo "✅ 푸시 성공: ${FULL_IMAGE_NAME}"
    else
        echo "❌ 푸시 실패: ${FULL_IMAGE_NAME}"
        exit 1
    fi
    
    # latest 태그도 푸시 (버전이 latest가 아닌 경우)
    if [ "${VERSION}" != "latest" ]; then
        if docker push ${IMAGE_NAME}:latest; then
            echo "✅ 푸시 성공: ${IMAGE_NAME}:latest"
        else
            echo "❌ 푸시 실패: ${IMAGE_NAME}:latest"
        fi
    fi
    
    echo ""
    echo "🎉 모든 작업이 완료되었습니다!"
    echo "📋 빌드된 이미지: ${FULL_IMAGE_NAME}"
    echo "🌐 Docker Hub: https://hub.docker.com/r/${IMAGE_NAME}"
    
    # 로컬 이미지 정리 옵션
    echo ""
    echo "🧹 로컬 이미지를 정리하시겠습니까? (y/N)"
    read -r cleanup_response
    
    if [[ "$cleanup_response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        echo "🧹 로컬 이미지 정리 중..."
        
        # 사용하지 않는 dangling 이미지 제거
        if docker image prune -f; then
            echo "✅ Dangling 이미지 정리 완료"
        fi
        
        # 빌드 캐시 정리 (옵션)
        echo "🗑️  빌드 캐시도 정리하시겠습니까? (y/N)"
        read -r cache_response
        
        if [[ "$cache_response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
            if docker builder prune -f; then
                echo "✅ 빌드 캐시 정리 완료"
            fi
        fi
        
        echo "🧹 로컬 정리 작업 완료!"
    fi
else
    echo "📋 빌드만 완료되었습니다: ${FULL_IMAGE_NAME}"
fi

echo ""
echo "💡 이미지 실행 명령어:"
echo "   docker run -p 3000:3000 ${FULL_IMAGE_NAME}"
echo "   또는"
echo "   docker-compose up -d"
