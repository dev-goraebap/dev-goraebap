export type CursorExtractor<T> = (item: T) => Record<string, number | string | Date>;

export type CursorPaginationModel<T> = {
  items: T[];
  hasMore: boolean;
  nextCursor?: string;
}

/**
 * 커서 기반 페이지네이션 모델 생성
 * @param rawItems perPage + 1개로 조회된 원본 데이터 (hasMore 판단용)
 * @param perPage 페이지당 항목 수
 * @param cursorExtractor 마지막 항목에서 커서 데이터를 추출하는 함수
 */
export function withCursor<T>(
  rawItems: T[],
  perPage: number,
  cursorExtractor: CursorExtractor<T>
): CursorPaginationModel<T> {
  const hasMore = rawItems.length > perPage;
  const items = rawItems.slice(0, perPage);

  let nextCursor: string | undefined;
  if (hasMore && items.length > 0) {
    const lastItem = rawItems[perPage - 1];
    const cursorData = cursorExtractor(lastItem);
    nextCursor = JSON.stringify(cursorData);
  }

  return {
    items,
    hasMore,
    nextCursor
  };
}
