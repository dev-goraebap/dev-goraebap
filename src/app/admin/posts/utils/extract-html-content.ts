/**
 * TinyMCE HTML 콘텐츠에서 필요한 정보를 추출하는 유틸리티
 */

/**
 * HTML 문자열에서 첫 번째 h1 태그의 텍스트를 추출하는 함수
 * @param htmlString - TinyMCE HTML 문자열
 * @returns 첫 번째 h1의 텍스트 또는 빈 문자열
 */
export function extractFirstH1(htmlString: string): string {
  try {
    // HTML 태그를 제거하고 텍스트만 추출하는 정규식
    const h1Match = htmlString.match(/<h1[^>]*>(.*?)<\/h1>/i);
    
    if (h1Match && h1Match[1]) {
      // HTML 엔티티 디코딩 및 내부 태그 제거
      return h1Match[1]
        .replace(/<[^>]*>/g, '') // HTML 태그 제거
        .replace(/&nbsp;/g, ' ') // 공백 엔티티 변환
        .replace(/&amp;/g, '&') // & 엔티티 변환
        .replace(/&lt;/g, '<') // < 엔티티 변환
        .replace(/&gt;/g, '>') // > 엔티티 변환
        .replace(/&quot;/g, '"') // " 엔티티 변환
        .trim();
    }
    
    return '';
  } catch (error) {
    console.error('H1 추출 실패:', error);
    return '';
  }
}

/**
 * HTML 문자열에서 첫 번째 p 태그의 텍스트를 추출하는 함수
 * @param htmlString - TinyMCE HTML 문자열
 * @returns 첫 번째 p의 텍스트 또는 빈 문자열
 */
export function extractFirstParagraph(htmlString: string): string {
  try {
    // p 태그를 찾는 정규식
    const pMatch = htmlString.match(/<p[^>]*>(.*?)<\/p>/i);
    
    if (pMatch && pMatch[1]) {
      // HTML 엔티티 디코딩 및 내부 태그 제거
      return pMatch[1]
        .replace(/<[^>]*>/g, '') // HTML 태그 제거
        .replace(/&nbsp;/g, ' ') // 공백 엔티티 변환
        .replace(/&amp;/g, '&') // & 엔티티 변환
        .replace(/&lt;/g, '<') // < 엔티티 변환
        .replace(/&gt;/g, '>') // > 엔티티 변환
        .replace(/&quot;/g, '"') // " 엔티티 변환
        .trim();
    }
    
    return '';
  } catch (error) {
    console.error('Paragraph 추출 실패:', error);
    return '';
  }
}

/**
 * HTML 문자열에서 모든 이미지 URL을 추출하는 함수
 * @param htmlString - TinyMCE HTML 문자열
 * @returns 이미지 URL 배열
 */
export function extractImageUrls(htmlString: string): string[] {
  const imageUrls: string[] = [];

  try {
    // img 태그의 src 속성을 찾는 정규식
    const imgMatches = htmlString.matchAll(/<img[^>]+src\s*=\s*["']([^"']+)["'][^>]*>/gi);
    
    for (const match of imgMatches) {
      if (match[1]) {
        imageUrls.push(match[1]);
      }
    }
  } catch (error) {
    console.error('이미지 URL 추출 실패:', error);
    return [];
  }

  return imageUrls;
}

/**
 * HTML 콘텐츠에서 title과 summary가 모두 존재하는지 검증하는 함수
 * @param htmlString - TinyMCE HTML 문자열
 * @returns 검증 결과와 추출된 데이터
 */
export function validateAndExtractContent(htmlString: string): {
  isValid: boolean;
  title: string;
  summary: string;
  imageUrls: string[];
  errors: string[];
} {
  const errors: string[] = [];
  const title = extractFirstH1(htmlString);
  const summary = extractFirstParagraph(htmlString);
  const imageUrls = extractImageUrls(htmlString);

  if (!title) {
    errors.push('첫 번째 H1 태그가 필요합니다.');
  }

  if (!summary) {
    errors.push('첫 번째 P 태그가 필요합니다.');
  }

  return {
    isValid: errors.length === 0,
    title,
    summary,
    imageUrls,
    errors,
  };
}