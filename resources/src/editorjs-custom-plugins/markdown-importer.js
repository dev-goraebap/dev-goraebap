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
    // marked를 사용해서 토큰화
    const tokens = marked.lexer(markdown);
    
    const currentIndex = this.api.blocks.getCurrentBlockIndex();
    this.api.blocks.delete(currentIndex);

    // 각 토큰을 EditorJS 블록으로 변환
    let insertIndex = currentIndex;
    tokens.forEach(token => {
      const blockData = this.convertTokenToBlock(token);
      if (blockData) {
        this.api.blocks.insert(
          blockData.type,
          blockData.data,
          {},
          insertIndex
        );
        insertIndex++;
      }
    });
  }

  convertTokenToBlock(token) {
    switch (token.type) {
      case 'heading':
        return {
          type: 'header',
          data: {
            text: this.processInlineMarkdown(token.text),
            level: token.depth
          }
        };
      
      case 'paragraph':
        return {
          type: 'paragraph',
          data: {
            text: this.processInlineMarkdown(token.text)
          }
        };
      
      case 'list':
        const items = token.items.map(item => this.processInlineMarkdown(item.text));
        return {
          type: 'list',
          data: {
            style: token.ordered ? 'ordered' : 'unordered',
            items: items
          }
        };
      
      case 'code':
        const language = token.lang || '';
        const codeClass = language ? ` class="language-${language}"` : '';
        return {
          type: 'paragraph',
          data: {
            text: `<pre><code${codeClass}>${token.text}</code></pre>`
          }
        };
        
      case 'codespan':
        return {
          type: 'paragraph',
          data: {
            text: `<code>${token.text}</code>`
          }
        };
      
      case 'blockquote':
        return {
          type: 'paragraph',
          data: {
            text: this.cleanHtml(token.text)
          }
        };
      
      case 'hr':
        return {
          type: 'paragraph',
          data: {
            text: '<hr>'
          }
        };
      
      case 'space':
        return null;
      
      default:
        return {
          type: 'paragraph',
          data: {
            text: this.cleanHtml(token.raw || '')
          }
        };
    }
  }

  processInlineMarkdown(text) {
    if (!text) return '';
    
    // marked를 사용해 인라인 요소만 변환
    const inlineHtml = marked.parseInline(text);
    return this.cleanHtml(inlineHtml);
  }

  cleanHtml(text) {
    if (!text) return '';
    
    return text
      .replace(/<strong>(.*?)<\/strong>/g, '<b>$1</b>')
      .replace(/<em>(.*?)<\/em>/g, '<i>$1</i>')
      .replace(/<code>(.*?)<\/code>/g, '<code>$1</code>')
      .replace(/<a href="([^"]*)"[^>]*>(.*?)<\/a>/g, '<a href="$1">$2</a>')
      .replace(/<(?!\/?(?:b|i|code|pre|hr|a\s)[^>]*>)[^>]*>/g, '')
      .trim();
  }

  save() {
    return {};
  }
}
