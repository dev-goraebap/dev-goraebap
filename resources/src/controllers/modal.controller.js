import { Controller } from '@hotwired/stimulus';

export class ModalController extends Controller {
  static targets = ['modalOverlay', 'modalContentFrame'];

  // onOpen 액션을 가지는 dom에 data-content-url 을 가지게끔 설정
  // ex) data-content-url="/admin/tags/new"
  // 해당 url로 turbo-frame url을 변경시킴
  onOpen(event) {
    const contentUrl = event.currentTarget.dataset.contentUrl;
    if (!contentUrl) {
      throw new Error('not found data-content-url');
    }

    this.modalContentFrameTarget.src = contentUrl;
    this.modalOverlayTarget.setAttribute('open', true);
  }

  onClose() {
    this.modalOverlayTarget.removeAttribute('open');
    this.modalContentFrameTarget.removeAttribute('src');
    this.modalContentFrameTarget.innerHTML = '';
  }
}
