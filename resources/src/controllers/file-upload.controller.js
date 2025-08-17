import { Controller } from '@hotwired/stimulus';

export class FileUploadController extends Controller {
  static targets = ['fileInput', 'filePondBlobIds'];

  async connect() {
    // Create a FilePond instance
    if (!this.hasFileInputTarget) {
      return;
    }

    try {
      // 동적으로 FilePond와 필요한 플러그인들 임포트 (CSS는 style.css에서 미리 로드됨)
      const [
        FilePondModule,
        FilePondPluginFileValidateSize,
        FilePondPluginFileValidateType,
        FilePondPluginImagePreview,
        FilePondPluginImageValidateSize
      ] = await Promise.all([
        import('filepond'),
        import('filepond-plugin-file-validate-size'),
        import('filepond-plugin-file-validate-type'),
        import('filepond-plugin-image-preview'),
        import('filepond-plugin-image-validate-size')
      ]);

      // FilePond 객체 추출 (default export 처리)
      const FilePond = FilePondModule.default || FilePondModule;

      // 플러그인 등록
      FilePond.registerPlugin(
        FilePondPluginFileValidateSize.default || FilePondPluginFileValidateSize,
        FilePondPluginImagePreview.default || FilePondPluginImagePreview,
        FilePondPluginImageValidateSize.default || FilePondPluginImageValidateSize,
        FilePondPluginFileValidateType.default || FilePondPluginFileValidateType,
      );

      this.pond = FilePond.create(this.fileInputTarget, {
        acceptedFileTypes: ['image/*'],
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
              console.debug('FilePond 업로드 성공:', result);
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
          console.debug(fileItem);
          if (!error) {
            console.debug('FilePond 파일 추가:', fileItem);
            this.updateHiddenInput();
          }
        },

        // 파일이 제거될 때마다 숨겨진 input 업데이트
        onremovefile: (error, fileItem) => {
          if (!error) {
            console.debug('FilePond 파일 제거:', fileItem);
            this.updateHiddenInput();
          }
        },

        // 파일 처리 시작
        onprocessfilestart: (fileItem) => {
          console.debug('FilePond 업로드 시작:', fileItem.filename);
        },

        // 파일 처리 완료
        onprocessfile: (error, fileItem) => {
          if (!error) {
            console.debug('FilePond 업로드 완료:', fileItem.filename, 'Server ID:', fileItem.serverId);
            this.updateHiddenInput();
          }
        },
      });

    } catch (error) {
      console.error('FilePond 라이브러리 로드 실패:', error);
      // 폴백 처리 또는 에러 핸들링
    }
  }

  updateHiddenInput() {
    const files = this.pond.getFiles();
    const blobIds = [];

    files.forEach((fileItem) => {
      // 서버에 업로드 완료된 파일의 blobId 수집
      if (fileItem.serverId) {
        blobIds.push(fileItem.serverId);
        console.debug('업로드된 파일 blobId:', fileItem.serverId, '파일명:', fileItem.filename);
      } else if (fileItem.file && fileItem.file instanceof File) {
        // 아직 업로드되지 않은 파일
        console.debug('업로드 대기 중 파일:', fileItem.filename);
      }
    });

    // blobIds를 전용 hidden input에 저장 (있는 경우에만)
    if (this.hasFilePondBlobIdsTarget) {
      // 썸네일은 하나만 등록이므로 첫 번째 blobId만 저장
      const thumbnailBlobId = blobIds.length > 0 ? blobIds[0] : '';
      this.filePondBlobIdsTarget.value = thumbnailBlobId;
      console.debug('thumbnailBlobId input에 저장:', thumbnailBlobId);
    }

    console.debug('저장된 blobIds:', blobIds);
    console.debug('전체 FilePond 파일 수:', files.length);
  }

  disconnect() {
    if (this.pond) {
      this.pond.destroy();
    }
  }
}