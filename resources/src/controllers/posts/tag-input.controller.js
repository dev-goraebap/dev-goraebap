import { Controller } from '@hotwired/stimulus';

export class TagInputController extends Controller {
  static targets = ['input', 'container', 'template', 'tagText', 'hiddenInput'];
  static values = { 
    maxTags: { type: Number, default: 3 },
    existing: Array
  };

  connect() {
    this.checkMaxTags();
  }

  onKeydown(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      const value = this.inputTarget.value.trim();
      if (value) {
        this.addTag(value, true); // true = 중복체크 함
        this.inputTarget.value = '';
      }
    }
  }

  addTag(tagName, checkDuplicate = true) {
    // 중복 체크
    if (checkDuplicate && this.isDuplicate(tagName)) {
      alert(`'${tagName}' 태그는 이미 추가되었습니다.`);
      return;
    }

    // 현재 태그 개수 확인
    const currentTags = this.containerTarget.querySelectorAll('.tag');

    if (currentTags.length >= this.maxTagsValue) {
      alert(`최대 ${this.maxTagsValue}개까지만 등록 가능합니다.`);
      return;
    }

    // 템플릿 복제
    const tagElement = this.templateTarget.content.cloneNode(true);

    // 태그 텍스트와 히든 인풋 값 설정
    tagElement.querySelector('[data-tag-input-target="tagText"]').textContent =
      tagName;
    tagElement.querySelector('[data-tag-input-target="hiddenInput"]').value =
      tagName;

    // 컨테이너에 추가
    this.containerTarget.appendChild(tagElement);

    // 최대 개수 도달시 입력 필드 비활성화
    this.checkMaxTags();
  }

  isDuplicate(tagName) {
    const existingTags = this.containerTarget.querySelectorAll('[data-tag-input-target="hiddenInput"]');
    return Array.from(existingTags).some(input => input.value === tagName);
  }

  removeTag(event) {
    event.target.closest('.tag').remove();
    this.checkMaxTags();
  }

  checkMaxTags() {
    const currentTags = this.containerTarget.querySelectorAll('.tag');
    const isMaxReached = currentTags.length >= this.maxTagsValue;

    this.inputTarget.disabled = isMaxReached;
    this.inputTarget.placeholder = isMaxReached
      ? `최대 ${this.maxTagsValue}개 등록됨`
      : '태그 입력 후 Enter';
  }
}