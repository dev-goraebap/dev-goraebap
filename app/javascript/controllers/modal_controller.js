// app/javascript/controllers/modal_controller.js
import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  // 선택: ESC 눌렀을 때 닫기
  connect() {
    document.addEventListener("keydown", this.boundClose.bind(this));
  }

  close() {
    this.element.remove();
  }

  disconnect() {
    document.removeEventListener("keydown", this.boundClose.bind(this));
  }

  boundClose(e) {
    if (e.key === "Escape") this.close();
  }
}
