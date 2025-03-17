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
  
  static values = {
    current: Number,
    total: Number
  }
  
  connect() {
    this.projects = window.projectsData || [];
    if (!this.projects.length) {
      console.error("프로젝트 데이터를 찾을 수 없습니다.");
      return;
    }

    // currentValue 초기화
    if (!this.hasCurrentValue) {
      this.currentValue = 0;
    }
    
    this.totalValue = this.projects.length;

    // 초기 카드 설정
    this.preloadImages();
    this.updateContent();
    this.updateIndicators();
  }

  /** ✅ 초기 3장 이미지 미리 로드 */
  preloadImages() {
    if (this.totalValue < 3) return;

    this.leftImageTarget.src = this.projects[(this.totalValue - 1) % this.totalValue].mainImage;
    this.centerImageTarget.src = this.projects[this.currentValue].mainImage;
    this.rightImageTarget.src = this.projects[(this.currentValue + 1) % this.totalValue].mainImage;
  }

  prev() {
    this.rotateCards(-1); // 왼쪽 방향(-1)으로 회전
  }
  
  next() {
    this.rotateCards(1); // 오른쪽 방향(1)으로 회전
  }
  
  goToSlide(event) {
    const targetIndex = parseInt(event.currentTarget.dataset.index);
    if (targetIndex === this.currentValue) return;
    
    const direction = targetIndex > this.currentValue ? 1 : -1;
    this.rotateCards(direction, targetIndex);
  }

  /** ✅ `currentValue` 업데이트 순서 조정 */
  rotateCards(direction, targetIndex = null) {
    // currentValue 먼저 업데이트
    this.currentValue = targetIndex !== null ? targetIndex : (this.currentValue + direction + this.totalValue) % this.totalValue;

    if (direction > 0) {
      this.animateNext();
    } else {
      this.animatePrev();
    }

    // 콘텐츠 업데이트 및 인디케이터 반영
    setTimeout(() => {
      this.updateContentWithAnimation();
      this.updateIndicators();
    }, 300);
  }

  animateNext() {
    const nextIndex = (this.currentValue + 1) % this.totalValue;
    
    // 현재 위치의 이미지들 저장
    const centerImage = this.centerImageTarget.src;
    const rightImage = this.rightImageTarget.src;
    
    // 이미지 이동 애니메이션
    this.leftImageTarget.src = centerImage;
    this.centerImageTarget.src = rightImage;
    this.rightImageTarget.src = this.projects[nextIndex].mainImage;
  }
  
  animatePrev() {
    const prevIndex = (this.currentValue - 1 + this.totalValue) % this.totalValue;
    
    // 현재 위치의 이미지들 저장
    const centerImage = this.centerImageTarget.src;
    const leftImage = this.leftImageTarget.src;
    
    // 이미지 이동 애니메이션
    this.rightImageTarget.src = centerImage;
    this.centerImageTarget.src = leftImage;
    this.leftImageTarget.src = this.projects[prevIndex].mainImage;
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
  
  updateContent() {
    const project = this.projects[this.currentValue];
    
    this.titleTarget.innerHTML = `${project.title}<span class="inline-block ml-2 text-primary">✨</span>`;
    this.descriptionTarget.textContent = project.description;
    
    this.tagContainerTarget.innerHTML = project.tags.map(tag => 
      `<span class="inline-block px-3 py-1 ${tag.bg} ${tag.text} text-xs font-semibold rounded-full">${tag.name}</span>`
    ).join('');
    
    this.featuresListTarget.innerHTML = project.features.map(feature => 
      `<li class="flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
        <span class="text-gray-600">${feature}</span>
      </li>`
    ).join('');
    
    this.projectLinkTarget.href = project.link;
  }
  
  updateIndicators() {
    const indicators = this.indicatorsTarget.querySelectorAll('button');
    indicators.forEach((indicator, index) => {
      if (index === this.currentValue) {
        indicator.classList.remove('w-1.5', 'bg-gray-300');
        indicator.classList.add('w-6', 'bg-primary');
      } else {
        indicator.classList.remove('w-6', 'bg-primary');
        indicator.classList.add('w-1.5', 'bg-gray-300');
      }
    });
  }
}
