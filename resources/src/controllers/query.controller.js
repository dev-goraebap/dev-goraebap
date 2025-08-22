import { Controller } from '@hotwired/stimulus';
import { createQuerystring } from '../utils/create-querystring';

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
    const newUrl = createQuerystring(this.element);
    document.getElementById(this.frameIdValue).src = newUrl;
  }
}
