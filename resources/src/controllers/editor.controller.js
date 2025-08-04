import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
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
        markdownImporter: MarkdownImporter,
      },
      placeholder: '내용을 입력하세요...',
    });
  }

  async handleSubmit(event) {
    event.preventDefault();
    const outputData = await this.editor.save();
    this.contentTarget.value = JSON.stringify(outputData);
    event.target.submit();
  }
}
