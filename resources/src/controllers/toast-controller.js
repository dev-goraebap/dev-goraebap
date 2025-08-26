import { Controller } from '@hotwired/stimulus';

export class ToastController extends Controller {
  connect() {
    setTimeout(() => {
      this.element.remove();
    }, 2e3);
  }
}
