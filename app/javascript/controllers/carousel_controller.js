// app/javascript/controllers/carousel_controller.js
import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = [
    "leftCard", "centerCard", "rightCard",
    "leftImage", "centerImage", "rightImage",
    "contentPanel", "title", "tagContainer", 
    "description", "featuresList", "projectLink",
    "indicators"
  ]
  
  // ✅ Stimulus Values로 projects/current/total 선언
  static values = {
    projects: Array,
    current: Number,
    total: Number
  }
  
  connect() {
    // projectsValue가 비어있다면 에러 로그
    if (!this.hasProjectsValue || !this.projectsValue.length) {
      console.error("프로젝트 데이터를 찾을 수 없습니다.");
      return;
    }

    // currentValue, totalValue가 설정되어 있지 않으면 디폴트 세팅
    if (!this.hasCurrentValue) {
      this.currentValue = 0;
    }
    if (!this.hasTotalValue) {
      this.totalValue = this.projectsValue.length;
    }

    // 초기에 이미지/콘텐츠 세팅
    this.preloadImages();
    this.updateContent();
    this.updateIndicators();
  }

  /** 초기 3장 이미지를 현재 인덱스 기준으로 로드 */
  preloadImages() {
    // 프로젝트가 3개 미만이라면 단순히 가운데 이미지만 로드
    if (this.totalValue < 3) {
      this.centerImageTarget.src = this.projectsValue[this.currentValue].main_image;
      return;
    }
    // 왼쪽/가운데/오른쪽 = 현재 프로젝트의 이미지들
    const project = this.projectsValue[this.currentValue];
    this.leftImageTarget.src   = project.left_image;
    this.centerImageTarget.src = project.main_image;
    this.rightImageTarget.src  = project.right_image;
  }

  // 왼쪽 버튼 클릭
  prev() {
    this.rotateCards(-1); 
  }
  
  // 오른쪽 버튼 클릭
  next() {
    this.rotateCards(1);
  }
  
  // 인디케이터 버튼 클릭 → 특정 슬라이드로 이동
  goToSlide(event) {
    const targetIndex = parseInt(event.currentTarget.dataset.index);
    if (targetIndex === this.currentValue) return;
    
    const direction = targetIndex > this.currentValue ? 1 : -1;
    this.rotateCards(direction, targetIndex);
  }

  rotateCards(direction, targetIndex = null) {
    // 새 currentValue 계산
    if (targetIndex !== null) {
      this.currentValue = targetIndex;
    } else {
      this.currentValue = (this.currentValue + direction + this.totalValue) % this.totalValue;
    }

    // 애니메이션
    if (direction > 0) {
      this.animateNext();
    } else {
      this.animatePrev();
    }

    setTimeout(() => {
      this.updateContentWithAnimation();
      this.updateIndicators();
    }, 300);
  }

  animateNext() {
    // nextIndex = 다음 프로젝트 인덱스
    const nextIndex = (this.currentValue + 1) % this.totalValue;

    // 현재 보여주고 있는 이미지 백업
    const centerImage = this.centerImageTarget.src;
    const rightImage  = this.rightImageTarget.src;

    // 왼쪽 카드에는 기존의 centerImage가 이동
    this.leftImageTarget.src   = centerImage;
    // 가운데는 기존의 rightImage
    this.centerImageTarget.src = rightImage;
    // 오른쪽은 새 프로젝트(nextIndex)의 right_image
    this.rightImageTarget.src  = this.projectsValue[nextIndex].right_image;
  }
  
  animatePrev() {
    // prevIndex = 이전 프로젝트 인덱스
    const prevIndex = (this.currentValue - 1 + this.totalValue) % this.totalValue;

    // 현재 보여주고 있는 이미지 백업
    const centerImage = this.centerImageTarget.src;
    const leftImage   = this.leftImageTarget.src;

    // 오른쪽 카드에는 기존의 centerImage가 이동
    this.rightImageTarget.src  = centerImage;
    // 가운데는 기존의 leftImage
    this.centerImageTarget.src = leftImage;
    // 왼쪽은 새 프로젝트(prevIndex)의 left_image
    this.leftImageTarget.src   = this.projectsValue[prevIndex].left_image;
  }
  
  updateContentWithAnimation() {
    this.contentPanelTarget.classList.add("fade-exit");
    
    setTimeout(() => {
      this.updateContent();
      this.contentPanelTarget.classList.remove("fade-exit");
      this.contentPanelTarget.classList.add("fade-enter");
      
      setTimeout(() => {
        this.contentPanelTarget.classList.remove("fade-enter");
      }, 500);
    }, 300);
  }

  /** 현재 currentValue의 프로젝트 정보로 텍스트/태그/링크 업데이트 */
  updateContent() {
    const project = this.projectsValue[this.currentValue];
    
    // 제목 + 이모지
    this.titleTarget.innerHTML = `${project.title}<span class="inline-block ml-2 text-primary">✨</span>`;
    // 설명
    this.descriptionTarget.textContent = project.description;
    
    // 태그
    this.tagContainerTarget.innerHTML = project.tags.map(tag =>
      `<span class="inline-block px-3 py-1 ${tag.bg} ${tag.text} text-xs font-semibold rounded-full">
        ${tag.name}
       </span>`
    ).join('');
    
    // 주요 기능 리스트
    this.featuresListTarget.innerHTML = project.features.map(feature =>
      `<li class="flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 
             1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 
             1 0 00-1.414 1.414l2 2a1 1 
             0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
        <span class="text-gray-600">${feature}</span>
      </li>`
    ).join('');
    
    // 프로젝트 상세보기 링크
    this.projectLinkTarget.href = project.link;
  }
  
  updateIndicators() {
    const indicators = this.indicatorsTarget.querySelectorAll("button");
    indicators.forEach((indicator, index) => {
      if (index === this.currentValue) {
        indicator.classList.remove("w-1.5", "bg-gray-300");
        indicator.classList.add("w-6", "bg-primary");
      } else {
        indicator.classList.remove("w-6", "bg-primary");
        indicator.classList.add("w-1.5", "bg-gray-300");
      }
    });
  }
}
