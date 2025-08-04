import { Controller } from '@hotwired/stimulus';
import * as FilePond from 'filepond';
import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';
import FilePondPluginImageValidateSize from 'filepond-plugin-image-validate-size';
import 'filepond/dist/filepond.min.css';

export class FileUploadController extends Controller {
  static targets = ['fileInput', 'hiddenInput'];

  async connect() {
    // Create a FilePond instance
    if (!this.hasFileInputTarget) {
      console.log('파일 인풋 없음!');
      return;
    }
    FilePond.registerPlugin(
      FilePondPluginFileValidateSize,
      FilePondPluginImagePreview,
      FilePondPluginImageValidateSize,
      FilePondPluginFileValidateType,
    );
    // 기존 파일 URL 확인
    const existingFile = this.fileInputTarget.dataset.existingFile;
    const files = existingFile ? [existingFile] : [];

    this.pond = FilePond.create(this.fileInputTarget, {
      acceptedFileTypes: ['image/*'],
      //  imageValidateSizeMinWidth: 400,
      //  imageValidateSizeMaxWidth: 420,
      //  imageValidateSizeMinHeight: 600,
      //  imageValidateSizeMaxHeight: 620,
      files: files,

      // 파일이 추가될 때마다 숨겨진 input 업데이트
      onaddfile: (error, fileItem) => {
        if (!error) {
          this.updateHiddenInput();
        }
      },

      // 파일이 제거될 때마다 숨겨진 input 업데이트
      onremovefile: (error, fileItem) => {
        if (!error) {
          this.updateHiddenInput();
        }
      },
    });
  }

  updateHiddenInput() {
    if (!this.hasHiddenInputTarget) return;

    const files = this.pond.getFiles();

    // DataTransfer를 사용해서 FileList 만들기
    const dataTransfer = new DataTransfer();

    files.forEach((fileItem) => {
      // URL로 로드된 파일이 아닌 실제 File 객체만 추가
      if (fileItem.file && fileItem.file instanceof File) {
        dataTransfer.items.add(fileItem.file);
      }
    });

    // 숨겨진 input에 파일 설정
    this.hiddenInputTarget.files = dataTransfer.files;

    console.log('숨겨진 input 파일 수:', this.hiddenInputTarget.files.length);
  }

  disconnect() {
    if (this.pond) {
      this.pond.destroy();
    }
  }
}
