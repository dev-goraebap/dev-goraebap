import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import Image from '@editorjs/image';
import List from '@editorjs/list';
import Paragraph from '@editorjs/paragraph';
import { Controller } from '@hotwired/stimulus';

import { MarkdownImporter } from '../editorjs-custom-plugins/markdown-importer';

export class EditorController extends Controller {
  static targets = ['content'];

  connect() {
    this.editor = new EditorJS({
      holder: 'editorjs',
      tools: {
        header: Header,
        list: List,
        paragraph: Paragraph,
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
          // 추가 메타데이터
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
    event.preventDefault();
    const outputData = await this.editor.save();
    console.log('에디터 저장 데이터:', outputData);
    this.contentTarget.value = JSON.stringify(outputData);
    event.target.submit();
  }
}
