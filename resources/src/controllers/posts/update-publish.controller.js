import { Controller } from '@hotwired/stimulus';

export class UpdatePublishController extends Controller {
  static targets = ['form'];

  connect() {
    if (!this.hasFormTarget) {
      throw new Error('not found update publish form');
    }
  }

  onSubmit(event) {
    event.preventDefault();

    const checked = event.target.checked;

    const result = window.confirm(`발행여부를 ${checked ? '활성화' : '비활성화'} 하시겠어요?`);
    if (!result) {
      event.target.checked = !checked;
      return;
    }

    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'isPublished';
    input.value = checked;
    this.formTarget.appendChild(input);

    this.formTarget.requestSubmit();
  }
}
