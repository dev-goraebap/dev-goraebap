import { Controller } from '@hotwired/stimulus';

export class SeriesSelectPostController extends Controller {
  static targets = ['form'];

  connect() {
    if (!this.hasFormTarget) {
      throw new Error('not found series post select form');
    }
  }

  onSubmit(event) {
    event.preventDefault();

    const postId = event.target.dataset.postId;
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'postId';
    input.value = postId;

    this.formTarget.appendChild(input);
    this.formTarget.requestSubmit();
  }
}
