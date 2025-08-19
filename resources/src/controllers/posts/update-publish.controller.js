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
    console.log(checked);

    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'isPublished';
    input.value = checked;
    this.formTarget.appendChild(input);

    this.formTarget.requestSubmit();
  }
}
