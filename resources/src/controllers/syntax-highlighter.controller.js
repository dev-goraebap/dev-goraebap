import { Controller } from '@hotwired/stimulus';

export class SyntaxHighlighterController extends Controller {
  async connect() {
    try {
      // Prism.js 다이나믹 임포트
      const PrismModule = await import('prismjs');
      this.prism = PrismModule.default || PrismModule;

      // 테마별 CSS 동적 로드
      await this.loadThemeCSS();

      // 언어 로드
      await this.loadCoreLanguages();

      // 하이라이팅 실행
      this.prism.highlightAllUnder(this.element);

      // 테마 변경 감지 설정
      this.setupThemeObserver();

      console.debug('Prism.js 하이라이팅 완료');
    } catch (error) {
      console.error('Prism.js 로드 실패:', error);
    }
  }

  async loadCoreLanguages() {
    try {
      // 1. Markup (HTML)
      await import('prismjs/components/prism-markup');
      console.debug('✅ markup 로드됨');
      
      // 2. CSS
      await import('prismjs/components/prism-css');
      console.debug('✅ css 로드됨');
      
      // 3. C-like (JavaScript의 의존성)
      await import('prismjs/components/prism-clike');
      console.debug('✅ clike 로드됨');
      
      // 4. JavaScript (TypeScript의 의존성)
      await import('prismjs/components/prism-javascript');
      console.debug('✅ javascript 로드됨');
      
      // 5. TypeScript
      await import('prismjs/components/prism-typescript');
      console.debug('✅ typescript 로드됨');
      
      // 6. JSON
      await import('prismjs/components/prism-json');
      console.debug('✅ json 로드됨');
      
      // 7. Bash
      await import('prismjs/components/prism-bash');
      console.debug('✅ bash 로드됨');
      
    } catch (error) {
      console.error('언어 로드 중 에러:', error);
    }
  }

  async loadThemeCSS() {
    this.removePrismCSS();

    const theme = document.documentElement.getAttribute('data-theme');
    const isDark = theme === 'dark';
    const themeFile = isDark ? 'prism-twilight.min.css' : 'prism-tomorrow.min.css';
    const cssUrl = `https://cdnjs.cloudflare.com/ajax/libs/prism/1.30.0/themes/${themeFile}`;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = cssUrl;
    link.id = 'prism-theme-css';

    return new Promise((resolve, reject) => {
      link.onload = () => {
        console.debug(`Prism.js 테마 로드 완료: ${themeFile}`);
        resolve();
      };
      link.onerror = reject;
      document.head.appendChild(link);
    });
  }

  removePrismCSS() {
    const existingCSS = document.querySelector('#prism-theme-css');
    if (existingCSS) {
      existingCSS.remove();
    }
  }

  setupThemeObserver() {
    this.themeObserver = new MutationObserver(async (mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
          console.debug('테마 변경 감지, Prism.js CSS 재로드');
          await this.loadThemeCSS();
          if (this.prism) {
            this.prism.highlightAllUnder(this.element);
          }
          break;
        }
      }
    });

    this.themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
  }

  disconnect() {
    if (this.themeObserver) {
      this.themeObserver.disconnect();
    }
  }
}