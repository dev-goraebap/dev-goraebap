import { Controller } from '@hotwired/stimulus';

export class SyntaxHighlighterController extends Controller {
  async connect() {
    try {
      // Prism.js 다이나믹 임포트
      const PrismModule = await import('prismjs');
      this.prism = PrismModule.default || PrismModule;

      // 테마별 CSS 동적 로드
      await this.loadThemeCSS();

      // 필요한 언어 로드
      await this.loadLanguages(['javascript', 'typescript', 'css', 'html', 'json', 'bash', 'php']);

      // 하이라이팅 실행
      this.prism.highlightAllUnder(this.element);

      // 테마 변경 감지 설정
      this.setupThemeObserver();

      console.debug('Prism.js 하이라이팅 완료');
    } catch (error) {
      console.error('Prism.js 로드 실패:', error);
    }
  }

  async loadThemeCSS() {
    // 기존 Prism CSS 제거
    this.removePrismCSS();

    // 현재 테마 감지
    const theme = document.documentElement.getAttribute('data-theme');
    const isDark = theme === 'dark';

    // 테마별 CSS 파일 선택
    const themeFile = isDark ? 'prism-twilight.min.css' : 'prism-tomorrow.min.css';

    const cssUrl = `https://cdnjs.cloudflare.com/ajax/libs/prism/1.30.0/themes/${themeFile}`;

    // CSS 로드
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = cssUrl;
    link.id = 'prism-theme-css';

    return new Promise((resolve, reject) => {
      link.onload = () => {
        console.debug(`Prism.js 테마 로드 완료: ${isDark ? 'Tomorrow Night' : 'Solarized Light'}`);
        resolve();
      };
      link.onerror = reject;
      document.head.appendChild(link);
    });
  }

  removePrismCSS() {
    // 기존 Prism CSS 제거
    const existingCSS = document.querySelector('#prism-theme-css');
    if (existingCSS) {
      existingCSS.remove();
    }
  }

  async loadLanguages(languages) {
    const loadPromises = languages.map(async (lang) => {
      try {
        // 언어별 플러그인 다이나믹 임포트
        await import(`prismjs/components/prism-${lang}`);
      } catch (error) {
        // 이미 로드되었거나 해당 언어가 없는 경우 무시
        console.debug(`Prism 언어 플러그인 로드 건너뜀: ${lang}`);
      }
    });

    await Promise.allSettled(loadPromises);
  }

  setupThemeObserver() {
    // MutationObserver로 data-theme 변경 감지
    this.themeObserver = new MutationObserver(async (mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
          console.debug('테마 변경 감지, Prism.js CSS 재로드');
          await this.loadThemeCSS();
          // 하이라이팅 다시 실행
          if (this.prism) {
            this.prism.highlightAllUnder(this.element);
          }
          break;
        }
      }
    });

    // document.documentElement의 attributes 변경 감지
    this.themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
  }

  disconnect() {
    // MutationObserver 정리
    if (this.themeObserver) {
      this.themeObserver.disconnect();
    }
  }
}
