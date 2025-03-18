// app/javascript/controllers/carousel_controller.js
import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = [
    // Carousel 파셜
    "carouselEl",
    "primaryThumbnail",
    "secondaryThumbnail",
    "tertiaryThumbnail",
    // ProjectInfo 파셜
    "projectInfoEl",
    "title",
    "description",
    "tagsEl",
    "featuresEl",
    "linkEl",
  ];

  static values = {
    projects: Array,
  };

  connect() {}

  next() {
    // 프로젝트 배열 재정렬 (0->1, 1->2, 2->0)
    const projects = [...this.projectsValue];
    const firstProject = projects.shift(); // 첫 번째 요소 제거 후 저장
    projects.push(firstProject); // 맨 뒤에 추가
    // 업데이트된 배열 저장
    this.projectsValue = projects;

    this.render();
  }

  prev() {
    // 프로젝트 배열 재정렬 (0->2, 1->0, 2->1)
    const projects = [...this.projectsValue];
    const lastProject = projects.pop(); // 마지막 요소 제거
    projects.unshift(lastProject); // 배열 맨 앞에 추가
    // 업데이트된 배열 저장
    this.projectsValue = projects;

    this.render();
  }

  render() {
    this.refreshAnims();

    // 케러셀 이미지 업데이트
    this.primaryThumbnailTarget.src = this.projectsValue[0].thumbnail;
    this.secondaryThumbnailTarget.src = this.projectsValue[1].thumbnail;
    this.tertiaryThumbnailTarget.src = this.projectsValue[2].thumbnail;

    // 메인 프로젝트(첫번째 프로젝트) 변수 할당
    const project = this.projectsValue[0];

    // 제목 등 메타데이터 업데이트
    this.titleTarget.textContent = project.title;
    this.descriptionTarget.textContent = project.description;
    this.linkElTarget.href = project.link;

    // 태그 목록 업데이트
    this.tagsElTarget.innerHTML = project.tags
      .map(
        (x) => `
        <span class="inline-block px-3 py-1 ${x.bg} ${x.text} text-xs font-semibold rounded-full fade-in">
          ${x.name}
        </span>
        `
      )
      .join("");

    // 핵심 기능 목록 업데이트
    this.featuresElTarget.innerHTML = project.features
      .map(
        (x) => `
      <li class="flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 
              7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
        <span class="text-gray-600">${x}</span>
      </li> 
      `
      )
      .join("");
  }

  // 애니메이션 효과 리플로우
  refreshAnims() {
    // 데이터 정보 컨테이너

    const targets = [this.carouselElTarget, this.projectInfoElTarget];

    targets.forEach((x) => {
      // 클래스 제거
      x.classList.remove(
        "motion-opacity-in-[0]",
        "motion-translate-y-in-[5%]",
        "motion-duration-[0.7s]",
        "motion-ease-in-out"
      );

      // 강제 리플로우 발생
      void x.offsetWidth;

      // 클래스 다시 추가
      x.classList.add(
        "motion-opacity-in-[0]",
        "motion-translate-y-in-[5%]",
        "motion-duration-[0.7s]",
        "motion-ease-in-out"
      );
    });
  }
}
