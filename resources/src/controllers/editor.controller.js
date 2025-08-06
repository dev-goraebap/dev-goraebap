import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import Image from '@editorjs/image';
import List from '@editorjs/list';
import Paragraph from '@editorjs/paragraph';
import { Controller } from '@hotwired/stimulus';
import edjsHTML from 'editorjs-html';

import { MarkdownImporter } from '../editorjs-custom-plugins/markdown-importer';

export class EditorController extends Controller {
  static targets = ['content', 'contentHtml'];

  connect() {
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
        console.log('EditorJS 준비 완료');
      },
    });
  }

  async uploadByFile(file) {
    console.log('파일 업로드 시작:', file);
    
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
      console.log('업로드 성공:', result);

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

      console.log('데이터 저장 시작...');
      const outputData = await this.editor.save();
      console.log('에디터 저장 데이터:', outputData);
      
      // JSON 저장
      this.contentTarget.value = JSON.stringify(outputData);
      
      // HTML 변환 후 저장
      const edjsParser = edjsHTML();
      const html = edjsParser.parse(outputData);
      const htmlString = Array.isArray(html) ? html.join('') : html;
      this.contentHtmlTarget.value = htmlString;
      
      console.log('변환된 HTML:', this.contentHtmlTarget.value);
      
      // Turbo가 폼을 제출하도록 그대로 둠
      // event.target.submit(); // 이 줄도 제거!
      
    } catch (error) {
      console.error('저장 중 오류:', error);
      event.preventDefault(); // 에러가 있을 때만 폼 제출을 막음
      alert('저장 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  }

  disconnect() {
    if (this.editor && typeof this.editor.destroy === 'function') {
      this.editor.destroy();
    }
  }
}