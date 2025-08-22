/**
 * 폼 데이터로부터 쿼리 스트링을 생성하고 브라우저 URL을 업데이트합니다
 *
 * @param {HTMLFormElement} formElement - 데이터를 추출할 폼 엘리먼트
 * @returns {string} 업데이트된 쿼리 파라미터가 포함된 새로운 URL
 *
 * @description
 * - 모든 폼 데이터를 추출하여 URL 검색 파라미터로 변환합니다
 * - 빈 값이나 공백만 있는 값들은 필터링합니다
 * - 페이지 새로고침 없이 history.replaceState를 사용하여 브라우저 URL을 업데이트합니다
 * - 현재 경로는 유지하면서 쿼리 스트링만 교체합니다
 *
 * @example
 * const form = document.querySelector('#myForm');
 * const newUrl = createQuerystring(form);
 * console.log(newUrl); // "https://example.com/page?name=홍길동&age=25"
 */
export function createQuerystring(formElement) {
  const formData = new FormData(formElement);
  const params = new URLSearchParams();

  for (const [key, value] of formData.entries()) {
    if (value && value.toString().trim() !== '') {
      params.append(key, value.toString());
    }
  }

  const currentUrl = new URL(window.location.href);
  const newUrl = `${currentUrl.pathname}?${params.toString()}`;

  // replaceState 대신 pushState 사용
  history.pushState({}, '', newUrl);

  return newUrl;
}
