// app/javascript/controllers/image_preview_controller.js
import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["input", "preview", "placeholder", "container"];

  connect() {
    console.log(this.element);
  }

  preview() {
    const input = this.inputTarget;
    
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        // 플레이스홀더 숨기기
        if (this.hasPlaceholderTarget) {
          this.placeholderTarget.classList.add("hidden");
        }
        
        // 미리보기 이미지 표시
        if (this.hasPreviewTarget) {
          this.previewTarget.src = e.target.result;
          this.previewTarget.classList.remove("hidden");
        }
      };
      
      reader.readAsDataURL(input.files[0]);
    }
  }
}
