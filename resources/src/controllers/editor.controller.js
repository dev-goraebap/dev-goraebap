import { Controller } from '@hotwired/stimulus';

export class EditorController extends Controller {
  static targets = ['content', 'contentHtml'];

  async connect() {
    try {
      // EditorJS와 모든 플러그인들을 동적으로 임포트
      const [
        EditorJSModule,
        HeaderModule,
        ImageModule,
        ListModule,
        ParagraphModule,
        edjsHTMLModule,
        MarkdownImporterModule
      ] = await Promise.all([
        import('@editorjs/editorjs'),
        import('@editorjs/header'),
        import('@editorjs/image'),
        import('@editorjs/list'),
        import('@editorjs/paragraph'),
        import('editorjs-html'),
        import('../editorjs-custom-plugins/markdown-importer')
      ]);

      // 모듈에서 필요한 클래스들 추출 (default export 처리)
      const EditorJS = EditorJSModule.default || EditorJSModule;
      const Header = HeaderModule.default || HeaderModule;
      const Image = ImageModule.default || ImageModule;
      const List = ListModule.default || ListModule;
      const Paragraph = ParagraphModule.default || ParagraphModule;
      const edjsHTML = edjsHTMLModule.default || edjsHTMLModule;
      const { MarkdownImporter } = MarkdownImporterModule;

      // EditorJS HTML 파서를 인스턴스 변수로 저장
      this.edjsParser = edjsHTML();

      const initialContent = this.contentTarget?.dataset?.initialContent;
      
      let parsedData;
      try {
        parsedData = initialContent && initialContent !== '{}' ? JSON.parse(initialContent) : undefined;
      } catch (error) {
        console.error('초기 데이터 파싱 실패:', error);
        parsedData = undefined;
      }
      
      this.editor = new EditorJS({
        holder: 'editorjs',
        data: parsedData,
        tools: {
          header: Header,
          list: List,
          paragraph: {
            class: Paragraph,
            inlineToolbar: true,
          },
          image: {
            class: Image,
            config: {
              uploader: {
                uploadByFile: this.uploadByFile.bind(this),
              },
            },
          },
          markdownImporter: MarkdownImporter,
        },
        placeholder: '내용을 입력하세요...',
        onReady: () => {
          console.debug('EditorJS 준비 완료');
        },
      });

    } catch (error) {
      console.error('EditorJS 라이브러리 로드 실패:', error);
      // 폴백 처리 또는 에러 메시지 표시
      alert('에디터를 불러오는데 실패했습니다. 페이지를 새로고침해주세요.');
    }
  }

  async uploadByFile(file) {
    console.debug('파일 업로드 시작:', file);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/admin/file-upload', {
        method: 'POST',
        body: formData,
        headers: {
          'X-CSRF-Token': document.querySelector('input[name="_csrf"]')?.value || '',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.debug('업로드 성공:', result);

      return {
        success: 1,
        file: {
          url: result.url,
          blobId: result.blobId,
          caption: result.filename,
          withBorder: false,
          withBackground: false,
          stretched: false,
        },
      };
    } catch (error) {
      console.error('업로드 실패:', error);
      return {
        success: 0,
        error: error.message,
      };
    }
  }

  async handleSubmit(event) {
    // Turbo가 폼을 처리하도록 하기 위해 preventDefault 제거
    // event.preventDefault(); // 이 줄을 제거!
    
    try {
      if (!this.editor) {
        throw new Error('에디터가 초기화되지 않았습니다.');
      }

      if (!this.edjsParser) {
        throw new Error('HTML 파서가 초기화되지 않았습니다.');
      }

      console.debug('데이터 저장 시작...');
      const outputData = await this.editor.save();
      console.debug('에디터 저장 데이터:', outputData);
      
      // JSON 저장
      this.contentTarget.value = JSON.stringify(outputData);
      
      // HTML 변환 후 저장
      const html = this.edjsParser.parse(outputData);
      const htmlString = Array.isArray(html) ? html.join('') : html;
      this.contentHtmlTarget.value = htmlString;
      
      console.debug('변환된 HTML:', this.contentHtmlTarget.value);
      
    } catch (error) {
      console.error('저장 중 오류:', error);
      event.preventDefault();
      alert('저장 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  }

  disconnect() {
    if (this.editor && typeof this.editor.destroy === 'function') {
      this.editor.destroy();
    }
  }
}