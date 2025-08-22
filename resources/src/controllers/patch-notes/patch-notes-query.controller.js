import { Controller } from '@hotwired/stimulus';

export class PatchNotesQueryController extends Controller {
  static targets = ['queryForm'];

  connect() {
    if (!this.hasQueryFormTarget) {
      throw new Error('not found patch notes query form');
    }
  }

  async onSubmit(event) {
    event.preventDefault();

    const value = event.target.value;
    console.log(value);

    this.queryFormTarget.elements['cursor'].value = '';

    this.queryFormTarget.requestSubmit();
  }

  onMore(event) {
    const button = event.currentTarget;
    const cursor = button.dataset?.cursor;

    if (!cursor) {
      window.alert('데이터를 불러오는데 실패하였습니다.');
      return;
    }

    button.disable = true;
    button.innerText = '';
    button.classList.add('btn-disabled');

    const span = document.createElement('span');
    span.classList.add('loading', 'loading-spinner');
    button.appendChild(span);

    this.queryFormTarget.elements['cursor'].value = cursor;

    this.queryFormTarget.requestSubmit();
  }
}