import { Controller } from '@hotwired/stimulus';

export class ViewQueryController extends Controller {
  static targets = ['queryForm'];

  static values = {
    action: String,
  };

  connect() {
    console.debug('viewQuery connect');
    if (!this.hasQueryFormTarget) {
      throw new Error('not found query form target from viewQuery');
    }
    if (!this.hasActionValue) {
      throw new Error('not found action value from viewQuery');
    }

    this.queryFormTarget.action = this.actionValue;
  }

  onChange() {
    this.onResetPage();
    this.queryFormTarget.requestSubmit();
  }

  onChangePerPage(event) {
    const value = event.target.value;
    const perPageInput = this.queryFormTarget.elements['perPage'];
    if (perPageInput) {
      this.onResetPage();
      perPageInput.value = value;
    }
    this.queryFormTarget.requestSubmit();
  }

  onChangePage(event) {
    const page = event.currentTarget.dataset.page;
    console.log(page);

    const pageInput = this.queryFormTarget.elements['page'];
    if (pageInput) {
      pageInput.value = page;
    }
    this.queryFormTarget.requestSubmit();
  }

  onResetPage() {
    const pageInput = this.queryFormTarget.elements['page'];
    if (pageInput) {
      pageInput.value = 1;
    }
  }
}
