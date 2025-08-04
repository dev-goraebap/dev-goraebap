import { Controller } from '@hotwired/stimulus';
import * as FilePond from 'filepond';
import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';
import FilePondPluginImageValidateSize from 'filepond-plugin-image-validate-size';
import 'filepond/dist/filepond.min.css';

export class FileUploadController extends Controller {
  static targets = ['fileInput', 'filePondBlobIds'];

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

      // 서버 업로드 설정
      server: {
        process: {
          url: '/api/admin/file-upload',
          method: 'POST',
          withCredentials: false,
          headers: {},
          timeout: 7000,
          onload: (response) => {
            const result = JSON.parse(response);
            console.log('FilePond 업로드 성공:', result);
            return result.blobId; // FilePond가 서버 ID로 사용할 값
          },
          onerror: (response) => {
            console.error('FilePond 업로드 실패:', response);
            return response;
          },
        },
        revert: null, // 업로드 취소 시 서버에서 삭제하지 않음 (고아 파일 정리 작업에서 처리)
        restore: null, // 기존 파일 복원 기능 비활성화
        load: null, // 외부 URL에서 파일 로드 비활성화
      },

      // 업로드 시 사용할 필드명 설정
      name: 'file', // 서버에서 기대하는 필드명과 일치

      // 파일이 추가될 때마다 숨겨진 input 업데이트
      onaddfile: (error, fileItem) => {
        if (!error) {
          console.log('FilePond 파일 추가:', fileItem);
          this.updateHiddenInput();
        }
      },

      // 파일이 제거될 때마다 숨겨진 input 업데이트
      onremovefile: (error, fileItem) => {
        if (!error) {
          console.log('FilePond 파일 제거:', fileItem);
          this.updateHiddenInput();
        }
      },

      // 파일 처리 시작
      onprocessfilestart: (fileItem) => {
        console.log('FilePond 업로드 시작:', fileItem.filename);
      },

      // 파일 처리 완료
      onprocessfile: (error, fileItem) => {
        if (!error) {
          console.log('FilePond 업로드 완료:', fileItem.filename, 'Server ID:', fileItem.serverId);
          this.updateHiddenInput();
        }
      },
    });
  }

  updateHiddenInput() {
    const files = this.pond.getFiles();
    const blobIds = [];

    files.forEach((fileItem) => {
      // 서버에 업로드 완료된 파일의 blobId 수집
      if (fileItem.serverId) {
        blobIds.push(fileItem.serverId);
        console.log('업로드된 파일 blobId:', fileItem.serverId, '파일명:', fileItem.filename);
      } else if (fileItem.file && fileItem.file instanceof File) {
        // 아직 업로드되지 않은 파일
        console.log('업로드 대기 중 파일:', fileItem.filename);
      }
    });

    // blobIds를 전용 hidden input에 저장 (있는 경우에만)
    if (this.hasFilePondBlobIdsTarget) {
      // 썸네일은 하나만 등록이므로 첫 번째 blobId만 저장
      const thumbnailBlobId = blobIds.length > 0 ? blobIds[0] : '';
      this.filePondBlobIdsTarget.value = thumbnailBlobId;
      console.log('thumbnailBlobId input에 저장:', thumbnailBlobId);
    }

    console.log('저장된 blobIds:', blobIds);
    console.log('전체 FilePond 파일 수:', files.length);
  }

  disconnect() {
    if (this.pond) {
      this.pond.destroy();
    }
  }
}
