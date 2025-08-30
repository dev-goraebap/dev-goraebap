import { Controller } from '@hotwired/stimulus';

export class ViewQueryController extends Controller {
  static targets = ['queryForm', 'sortButton'];

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

  onChangeSort(event) {
    const clickedButton = event.currentTarget;
    const fieldName = clickedButton.dataset.name;

    // 현재 상태를 미리 저장 (초기화 전에!)
    const currentType = clickedButton.dataset.type || 'NONE';
    const newType = currentType === 'ASC' ? 'DESC' : 'ASC';

    // 1. 모든 버튼 상태 초기화
    this.sortButtonTargets.forEach((button) => {
      button.dataset.type = 'NONE';
      button.querySelectorAll('.sort-icon').forEach((icon) => {
        icon.classList.add('hidden');
      });
    });

    // 2. 현재 버튼 상태 변경
    clickedButton.dataset.type = newType;
    const iconClass = newType === 'ASC' ? '.asc-icon' : '.desc-icon';
    const targetIcon = clickedButton.querySelector(iconClass);
    if (targetIcon) {
      targetIcon.classList.remove('hidden');
    }

    // 쿼리 업데이트
    const sortInput = this.queryFormTarget.elements['sort'];
    if (sortInput) {
      sortInput.value = newType === 'DESC' ? `-${fieldName}` : fieldName;
    }
    this.queryFormTarget.requestSubmit();
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
