import { Controller } from '@hotwired/stimulus';

export class FeedQueryController extends Controller {
  static targets = ['queryForm'];

  connect() {
    if (!this.hasQueryFormTarget) {
      throw new Error('not found feed query form');
    }
  }

  async onSubmit(event) {
    event.preventDefault();
    this.queryFormTarget.requestSubmit();
  }

  onMore(event) {
    const button = event.currentTarget;
    const cursor = button.dataset?.cursor;

    if (!cursor) {
      window.alert('데이터를 불러오는데 실패하였습니다.');
      return;
    }

    // 버튼 UI 변경
    button.disabled = true;
    button.innerText = '';
    button.classList.add('btn-disabled');
    const span = document.createElement('span');
    span.classList.add('loading', 'loading-spinner');
    button.appendChild(span);

    const formData = new FormData(this.queryFormTarget);
    formData.append('cursor', cursor);

    const params = new URLSearchParams(formData);
    fetch(`/?${params.toString()}`, {
      method: 'GET',
      headers: {
        Accept: 'text/vnd.turbo-stream.html',
      },
    })
      .then((response) => response.text())
      .then((stream) => Turbo.renderStreamMessage(stream));
  }

  onFilterTag(event) {
    const button = event.currentTarget;
    const value = button.dataset?.value;

    const tagInput = this.queryFormTarget.elements['tag'];
    // 기존에 선택된 태그를 한번 더 누르는 경우 태그 초기화
    // 다른 태그 선택 시 태그 변경

    if (tagInput.value === value) {
      tagInput.value = '';
    } else {
      tagInput.value = value;
    }

    this.queryFormTarget.requestSubmit();
  }
}
