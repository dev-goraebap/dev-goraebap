import { Controller } from '@hotwired/stimulus';

export class ThumbnailUploaderToggle extends Controller {
  static targets = ['render', 'previewTemplate', 'uploadTemplate'];

  static values = {
    mode: String, // create, update
  };

  connect() {
    console.debug(ThumbnailUploaderToggle.name);
    if (!this.hasRenderTarget) {
      throw new Error('not found render');
    }
    if (!this.hasPreviewTemplateTarget) {
      throw new Error('not found previewTemplate');
    }
    if (!this.hasUploadTemplateTarget) {
      throw new Error('not found uploadTemplate');
    }

    console.debug(this.modeValue);
    if (this.modeValue === 'update') {
      this.renderPreview();
    } else {
      this.renderUpload();
    }
  }

  onReUpload() {
    this.renderUpload();
  }

  renderPreview() {
    this.renderTarget.innerHTML = '';
    const clone = this.previewTemplateTarget.content.cloneNode(true);
    this.renderTarget.appendChild(clone);
  }

  renderUpload() {
    this.renderTarget.innerHTML = '';
    const clone = this.uploadTemplateTarget.content.cloneNode(true);
    this.renderTarget.appendChild(clone);
  }
}
