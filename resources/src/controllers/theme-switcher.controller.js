import { Controller } from '@hotwired/stimulus';

export class ThemeSwitcherController extends Controller {
  changeTheme(event) {
    const theme = event.currentTarget.dataset.setTheme;

    // 테마 변경
    document.documentElement.setAttribute('data-theme', theme);

    // 쿠키 설정
    this.setThemeCookie(theme);

    // 페이지 새로고침
    Turbo.visit(window.location.href);
  }

  setThemeCookie(theme) {
    const oneMonthInSeconds = 30 * 24 * 60 * 60;

    document.cookie = [
      `theme=${encodeURIComponent(theme)}`,
      `path=/`,
      `max-age=${oneMonthInSeconds}`,
      `SameSite=Lax`,
      location.protocol === 'https:' ? 'Secure' : '',
    ]
      .filter(Boolean)
      .join('; ');
  }
}
