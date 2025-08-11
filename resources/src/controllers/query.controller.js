import { Controller } from '@hotwired/stimulus';

export class QueryController extends Controller {
  static values = {
    frameId: String,
  };

  connect() {
    this.searchTimeout = null;
    if (!this.hasFrameIdValue) {
      throw new Error('FrameIdValue가 필요합니다.');
    }
  }

  onSearch(event) {
    const debounceMs = parseInt(event.target.dataset.debounceMs) || 500;

    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.navigateWithFormData();
    }, debounceMs);
  }

  onChangeOrderBy() {
    this.navigateWithFormData();
  }

  navigateWithFormData() {
    const formData = new FormData(this.element);
    const params = new URLSearchParams();

    for (const [key, value] of formData.entries()) {
      if (value && value.toString().trim() !== '') {
        params.append(key, value.toString());
      }
    }

    const currentUrl = new URL(window.location.href);
    const newUrl = `${currentUrl.pathname}?${params.toString()}`;

    document.getElementById(this.frameIdValue).src = newUrl;
    history.replaceState({}, '', newUrl);
  }
}
