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

    const value = event.target.value;
    console.log(value);

    this.queryFormTarget.elements['cursor'].value = '';

    this.queryFormTarget.requestSubmit();
  }

  onMore(event) {
    const cursor = event.currentTarget.dataset?.cursor;
    console.log(cursor);
    if (!cursor) {
      window.alert('데이터를 불러오는데 실패하였습니다.');
      return;
    }
    this.queryFormTarget.elements['cursor'].value = cursor;

    console.log(this.queryFormTarget.elements['cursor']);

    this.queryFormTarget.requestSubmit();
  }
}
