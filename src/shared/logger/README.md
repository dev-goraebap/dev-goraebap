# Winston + Grafana + PostgreSQL 로깅 시스템 구축기

개인 블로그를 만들면서 로그 모니터링이 필요해졌는데, Loki나 ELK 스택은 최소 비용 목표에서 벗어나는 것 같아서 이미 사용 중인 PostgreSQL을 활용해서 로깅 시스템을 구축한 경험담입니다.

## 왜 PostgreSQL을 선택했나?

### 원래 계획 vs 현실

**원래 계획**: 심플한 개인 블로그  
**현실**: 로그 모니터링, 시각화, 알림... 점점 복잡해지는 인프라

### Loki를 포기한 이유

- **인프라 복잡도 증가**: Docker Compose에 또 다른 서비스 추가
- **학습 비용**: LogQL이라는 새로운 쿼리 언어
- **리소스 오버헤드**: 작은 VPS에서 돌리기엔 부담
- **이미 PostgreSQL 사용 중**: 기존 인프라 최대한 활용하고 싶음

### PostgreSQL 로깅의 장점 (내 상황에서)

- 추가 인프라 불필요 - 기존 DB 활용
- SQL로 복잡한 로그 분석 가능
- 기존 애플리케이션 데이터와 JOIN 가능
- 트랜잭션 지원으로 데이터 일관성 보장
- 친숙한 백업/복원 프로세스

물론 단점도 있습니다:
- 대용량 로그 처리시 성능 이슈 가능
- 실시간 스트리밍은 Loki가 더 좋음
- 압축률이 전용 로그 시스템보다 낮음

## 삽질 과정과 해결책

### 삽질 1: "그냥 파일에 저장하면 안되나?"

**시도**: Winston으로 파일 저장 → Grafana에서 파일 읽기  
**결과**: 파일 파싱의 지옥

```typescript
// 이렇게 하지 마세요...
const logData = fs.readFileSync('app.log', 'utf-8')
  .split('\n')
  .filter(line => line.includes('ERROR'))
  .map(line => JSON.parse(line)); // 파싱 에러의 향연
```

**교훈**: 구조화된 데이터는 구조화된 저장소에

### 삽질 2: "실시간으로 DB에 저장하자"

삽질을 하진 않았지만 아래처럼 로깅 작성했더니, claude가 기겁을 하면서 배치를 사용하라고 하길래 바로 리팩토링 부탁

```typescript
// 이것도 하지 마세요...
async logError(message: string) {
  await this.db.query('INSERT INTO logs...'); // 매번 DB 호출
}
```

**해결책**: 배치 처리 시스템 도입

### 테이블 설계

**최종 설계**: 실제 운영을 고려한 구조

```sql
CREATE TABLE app_logs (
    id BIGSERIAL PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    level VARCHAR(10) NOT NULL,
    message TEXT NOT NULL,
    
    -- HTTP 요청 관련
    method VARCHAR(10),
    url TEXT,
    status_code INTEGER,
    response_time INTEGER,
    
    -- 사용자 정보
    user_id INTEGER,
    session_id VARCHAR(128),
    ip_address INET,
    
    -- 요청 추적
    request_id UUID,
    
    -- 에러 정보
    error_message TEXT,
    error_stack TEXT,
    
    -- 추가 메타데이터 (JSON)
    metadata JSONB,
    tags TEXT[] DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 성능을 위한 인덱스들 (근데.. 아직 느려본적이 없어서 채감좀 하고싶음 ;ㅅ;)
CREATE INDEX idx_app_logs_timestamp ON app_logs (timestamp DESC);
CREATE INDEX idx_app_logs_level ON app_logs (level);
CREATE INDEX idx_app_logs_user_id ON app_logs (user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_app_logs_level_timestamp ON app_logs (level, timestamp DESC);

-- JSONB와 배열 검색용 인덱스
CREATE INDEX idx_app_logs_metadata ON app_logs USING GIN (metadata);
CREATE INDEX idx_app_logs_tags ON app_logs USING GIN (tags);
```

## 실제 구현체

### 핵심 아키텍처

```
NestJS App → Winston Logger → 배치 큐 → PostgreSQL
                   ↓
               콘솔 출력 (실시간 디버깅용)
```

### 배치 처리 시스템

로그를 즉시 DB에 저장하지 않고 큐에 모았다가 배치로 처리:

```typescript
private logQueue: LogData[] = [];
private readonly BATCH_SIZE = 50;    // 50개씩 모아서 처리
private readonly BATCH_TIMEOUT = 5000; // 5초마다 또는 큐가 가득 찰 때

// 로그 발생시
addToQueue(logData: LogData) {
  this.logQueue.push(logData);
  
  // 즉시 콘솔 출력 (개발자 경험)
  console.log(`${logData.level}: ${logData.message}`);
  
  // 배치 크기 도달시 즉시 저장
  if (this.logQueue.length >= this.BATCH_SIZE) {
    this.flushLogs();
  }
}
```

**왜 배치 처리?**
- **성능**: DB 커넥션 최소화
- **비용**: DB 호출 횟수 감소
- **안정성**: 로그 저장 실패가 애플리케이션에 영향 없음

### 실전 사용 예시

```typescript
@Injectable()
export class PostService {
  constructor(private readonly logger: LoggerService) {}

  async createPost(createPostDto: CreatePostDto, userId: number) {
    const startTime = Date.now();

    try {
      const post = await this.postRepository.save(createPostDto);
      
      // 성공 로그 - 비즈니스 메트릭까지 포함
      this.logger.info('Post created successfully', {
        postId: post.id,
        userId,
        title: post.title,
        category: post.category,
        responseTime: Date.now() - startTime,
        tags: ['post', 'create', 'success']
      });

      return post;
    } catch (error) {
      // 에러 로그 - 디버깅에 필요한 모든 정보
      this.logger.error('Failed to create post', {
        userId,
        title: createPostDto.title,
        responseTime: Date.now() - startTime,
        error: error.message,
        stack: error.stack,
        tags: ['post', 'create', 'error']
      });
      throw error;
    }
  }
}
```

## Grafana 연동

### 유용한 대시보드 쿼리들 (Claude 추천)

```sql
-- 시간별 에러 발생 추이
SELECT 
  date_trunc('hour', timestamp) as time,
  COUNT(*) FILTER (WHERE level = 'ERROR') as errors,
  COUNT(*) FILTER (WHERE level = 'WARN') as warnings,
  COUNT(*) as total
FROM app_logs 
WHERE timestamp >= $__timeFrom() AND timestamp <= $__timeTo()
GROUP BY time
ORDER BY time;

-- API 엔드포인트별 성능 분석
SELECT 
  url,
  AVG(response_time) as avg_response_time,
  MAX(response_time) as max_response_time,
  COUNT(*) as request_count,
  COUNT(*) FILTER (WHERE status_code >= 400) as error_count
FROM app_logs 
WHERE method IS NOT NULL 
  AND timestamp >= $__timeFrom()
GROUP BY url
ORDER BY avg_response_time DESC;

-- 사용자별 활동 분석 (개인 블로그라서 재밌게 볼 수 있음)
SELECT 
  user_id,
  COUNT(*) as total_requests,
  COUNT(DISTINCT DATE(timestamp)) as active_days,
  MAX(timestamp) as last_activity
FROM app_logs 
WHERE user_id IS NOT NULL
GROUP BY user_id
ORDER BY total_requests DESC;
```

## 현실적인 성능과 한계

### 내 블로그 기준 (월 1만 PV 정도) (Claude 추천)

```
일일 로그 생성량: ~5,000건
월간 로그 누적: ~150,000건
DB 용량 증가: ~50MB/월
검색 성능: 1-2초 (인덱스 잘 설정했을 때)
```

**결론**: 소규모 서비스에서는 충분히 감당 가능

### 언제 다른 솔루션을 고려해야 할까? (Claude 추천)

- 일일 로그 100만건+ 생성시
- 실시간 로그 스트리밍이 중요할 때  
- 로그 보관 기간이 1년+ 필요할 때
- 다중 서버에서 중앙 집중 로깅 필요할 때

이때는 Loki나 ELK 스택을 진지하게 고려해보세요.

## 배운 교훈들

### 1. 완벽한 솔루션은 없다
- **Loki**: 아직 제대로 사용안해봐서 잘 모르겠음
- **PostgreSQL**: 트래픽이 제대로 몰려본적이 없어서 일단 느린지도 모르겠음.

### 2. 점진적 개선이 답 (Claude 추천)
```
1단계: PostgreSQL로 시작 (지금)
2단계: 로그량 증가시 파티셔닝 적용
3단계: 필요시 Loki 추가 (하이브리드)
4단계: 완전한 로그 시스템 전환
```

### 3. 비용 vs 복잡도 트레이드오프
**내 선택**: 약간의 성능 포기 → 인프라 단순성 확보
**결과**: 개발 속도 UP, 유지보수 부담 DOWN