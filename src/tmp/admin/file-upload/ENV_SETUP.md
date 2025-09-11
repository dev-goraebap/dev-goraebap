# 파일 업로드 API 환경변수 설정 가이드

## 필수 환경변수

파일 업로드 API가 정상적으로 작동하려면 다음 환경변수들을 설정해야 합니다:

```bash
R2_BUCKET_NAME=your-bucket-name
R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your-access-key-id
R2_SECRET_ACCESS_KEY=your-secret-access-key
R2_PUBLIC_URL=https://your-public-url.com
```

## Cloudflare R2 설정 단계별 가이드

### 1단계: Cloudflare 대시보드 접속
1. https://dash.cloudflare.com 접속 후 로그인
2. 좌측 메뉴에서 **"R2 Object Storage"** 클릭
   - 또는 우측 상단 계정 메뉴에서 **"R2"** 선택

### 2단계: 버킷 생성
1. **"Create bucket"** 버튼 클릭
2. 버킷 이름 입력 (예: `my-blog-files`, `uploads` 등)
   - 전역적으로 고유해야 함
   - 소문자, 숫자, 하이픈만 사용 가능
3. 생성 완료 후 버킷 이름을 `R2_BUCKET_NAME`에 사용

### 3단계: 계정 ID 확인
**방법 1: 사이드바에서 확인**
- 우측 사이드바에서 **"Account ID"** 복사

**방법 2: URL에서 확인**
- 현재 URL: `https://dash.cloudflare.com/{account-id}/r2`
- `{account-id}` 부분이 계정 ID

**사용법:**
```bash
# 계정 ID가 abc123def456 인 경우
R2_ENDPOINT=https://abc123def456.r2.cloudflarestorage.com
```

### 4단계: API 토큰 생성
1. R2 페이지에서 **"Manage R2 API tokens"** 클릭
   - 또는 **"My Profile"** → **"API Tokens"** → **"Create Token"**
2. **"R2 Token"** 템플릿 선택
3. 권한 설정:
   - **Account**: 본인 계정 선택
   - **Zone Resources**: `Include - All zones` 또는 특정 버킷
   - **Permissions**: `R2:Edit` (읽기/쓰기 권한 필요)
4. **"Continue to summary"** → **"Create Token"**
5. 생성된 토큰 정보 복사:
   - **Access Key ID** → `R2_ACCESS_KEY_ID`
   - **Secret Access Key** → `R2_SECRET_ACCESS_KEY`

⚠️ **중요**: Secret Access Key는 한 번만 표시되므로 반드시 안전한 곳에 저장하세요!

### 5단계: 퍼블릭 도메인 설정

#### 옵션 A: R2.dev 서브도메인 (간단함)
1. 생성한 버킷 클릭
2. **"Settings"** 탭으로 이동
3. **"Public access"** 섹션에서 **"Allow Access"** 활성화
4. 생성된 URL 복사 (예: `https://pub-abc123.r2.dev`)
5. 이 URL을 `R2_PUBLIC_URL`에 사용

#### 옵션 B: 커스텀 도메인 (권장)
1. 버킷에서 **"Custom domains"** 탭으로 이동
2. **"Connect Domain"** 클릭
3. 소유한 도메인 입력 (예: `files.mydomain.com`)
4. DNS 설정에 CNAME 레코드 추가 (화면에 표시된 값 사용)
5. 설정 완료 후 커스텀 도메인을 `R2_PUBLIC_URL`에 사용

## 환경변수 설정

### .env 파일 생성
프로젝트 루트에 `.env` 파일을 생성하고 다음 내용 추가:

```bash
# 실제 값으로 교체하세요
R2_BUCKET_NAME=my-blog-files
R2_ENDPOINT=https://abc123def456.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=a1b2c3d4e5f6g7h8i9j0
R2_SECRET_ACCESS_KEY=xyz789abc123def456ghi789jkl012mno345pqr678
R2_PUBLIC_URL=https://files.mydomain.com
```

## 설정 확인 및 테스트

### 1. 서버 실행
```bash
npm run start:dev
```

### 2. API 상태 확인
```bash
curl http://localhost:3000/api/admin/file-upload-test/health
```

**예상 응답:**
```json
{
  "status": "OK",
  "message": "File upload API is running"
}
```

### 3. 파일 업로드 테스트
```bash
curl -X POST -F "file=@test-image.jpg" http://localhost:3000/api/admin/file-upload
```

**성공 시 응답:**
```json
{
  "blobId": 1,
  "key": "abc123def456...",
  "filename": "test-image.jpg",
  "contentType": "image/jpeg",
  "byteSize": 102400,
  "url": "https://files.mydomain.com/ab/cd/abc123def456...",
  "metadata": { "type": "image" }
}
```

## 문제 해결

### 자주 발생하는 오류

**1. 403 Forbidden 에러**
- API 토큰 권한 확인
- 버킷 이름이 정확한지 확인
- 계정 ID가 올바른지 확인

**2. Network Error**
- R2_ENDPOINT URL 형식 확인
- 네트워크 연결 상태 확인

**3. 파일 업로드 후 URL 접근 불가**
- Public access 설정 확인
- 커스텀 도메인 DNS 설정 확인

### 디버그 방법
1. 환경변수 출력으로 설정값 확인:
```javascript
console.log('R2 Config:', {
  bucketName: process.env.R2_BUCKET_NAME,
  endpoint: process.env.R2_ENDPOINT,
  // 보안상 키는 출력하지 않음
});
```

2. R2 대시보드에서 파일 업로드 확인
3. 브라우저 네트워크 탭에서 요청/응답 확인

## 보안 주의사항

- `.env` 파일을 `.gitignore`에 추가
- API 키를 코드에 직접 삽입하지 않기
- 프로덕션 환경에서는 환경변수로만 설정
- 정기적으로 API 토큰 갱신