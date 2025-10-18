import { Controller } from '@hotwired/stimulus';

export class FeedQueryController extends Controller {
  static targets = ['queryForm'];

  connect() {
    // queryForm은 optional (패치노트 페이지에는 없음)
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

    // queryForm이 있으면 폼 데이터 사용, 없으면 빈 URLSearchParams
    let params;
    if (this.hasQueryFormTarget) {
      const formData = new FormData(this.queryFormTarget);
      formData.append('cursor', cursor);
      params = new URLSearchParams(formData);
    } else {
      params = new URLSearchParams({ cursor });
    }

    fetch(`${window.location.pathname}?${params.toString()}`, {
      method: 'GET',
      headers: {
        Accept: 'text/vnd.turbo-stream.html',
      },
    })
      .then((response) => response.text())
      .then((stream) => Turbo.renderStreamMessage(stream));
  }

  onFilterTag(event) {
    if (!this.hasQueryFormTarget) {
      return; // 패치노트 페이지에는 태그 필터 없음
    }

    const button = event.currentTarget;
    const value = button.dataset?.value;
    const paramName = button.dataset?.paramName || 'tag'; // 기본값 'tag'

    const input = this.queryFormTarget.elements[paramName];
    // 기존에 선택된 항목을 한번 더 누르는 경우 초기화
    // 다른 항목 선택 시 변경

    if (input.value === value) {
      input.value = '';
    } else {
      input.value = value;
    }

    this.queryFormTarget.requestSubmit();
  }
}
