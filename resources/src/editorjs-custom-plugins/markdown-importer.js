import { marked } from 'marked';

export class MarkdownImporter {
  static get toolbox() {
    return {
      title: 'Markdown 파일',
      icon: `
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m.75 12 3 3m0 0 3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
        </svg>
        `,
    };
  }

  constructor({ data, api }) {
    this.api = api;
    this.data = data;
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.classList.add('markdown-importer');

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.md,.markdown';
    input.style.display = 'none';

    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = 'Markdown 파일 선택';
    button.classList.add('btn', 'btn-outline');

    button.onclick = () => input.click();

    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const markdown = event.target.result;
          this.importMarkdown(markdown);
        };
        reader.readAsText(file);
      }
    };

    wrapper.appendChild(input);
    wrapper.appendChild(button);
    return wrapper;
  }

  importMarkdown(markdown) {
    // marked를 사용해서 HTML로 변환 후 EditorJS 블록으로 변환
    const html = marked(markdown);

    // HTML을 EditorJS 블록으로 변환하거나
    // 또는 간단하게 paragraph로 HTML 삽입
    const currentIndex = this.api.blocks.getCurrentBlockIndex();
    this.api.blocks.delete(currentIndex);

    // HTML을 paragraph로 삽입 (marked의 결과를 그대로 사용)
    this.api.blocks.insert(
      'paragraph',
      {
        text: html,
      },
      {},
      currentIndex,
    );
  }

  save() {
    return {};
  }
}
