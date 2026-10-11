import { Component, computed, effect, input, signal } from '@angular/core';

let shikiHighlighterPromise: Promise<any> | null = null;
function getHighlighter() {
  if (!shikiHighlighterPromise) {
    shikiHighlighterPromise = import('shiki').then((m) =>
      m.createHighlighter({
        themes: ['github-dark', 'github-light'],
        langs: ['typescript', 'javascript', 'html', 'css', 'json', 'bash', 'ts']
      })
    );
  }
  return shikiHighlighterPromise;
}

@Component({
  selector: 'app-code-block',
  standalone: true,
  template: `
    <div class="code-wrapper">
      <header class="code-header">
        <div class="code-file-tag">
          @if (block().file) {
            <span class="file-icon">📄</span>
            <span class="file-name">{{ block().file }}</span>
          } @else {
            <span class="lang-tag">{{ block().lang }}</span>
          }
        </div>
        <button type="button" class="copy-btn" (click)="copy()" [class.copied]="copied()">
          @if (copied()) {
            <span>✓ Đã copy</span>
          } @else {
            <span>📋 Copy</span>
          }
        </button>
      </header>

      @if (html()) {
        <div class="code-content" [innerHTML]="html()"></div>
      } @else {
        <pre class="fallback-pre"><code>{{ text() }}</code></pre>
      }
    </div>
  `,
  styles: [`
    .code-wrapper {
      margin: 1.5rem 0;
      border-radius: 10px;
      overflow: hidden;
      background: #0d1117;
      border: 1px solid var(--border-color, #30363d);
      box-shadow: 0 4px 16px rgba(0,0,0,0.25);
    }
    .code-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.6rem 1rem;
      background: #161b22;
      border-bottom: 1px solid #30363d;
      font-size: 0.85rem;
    }
    .code-file-tag {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      color: #c9d1d9;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-weight: 500;
    }
    .lang-tag {
      text-transform: uppercase;
      font-size: 0.75rem;
      color: #8b949e;
    }
    .copy-btn {
      background: transparent;
      border: 1px solid #30363d;
      border-radius: 6px;
      color: #c9d1d9;
      padding: 0.25rem 0.6rem;
      font-size: 0.8rem;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      transition: all 0.2s;
    }
    .copy-btn:hover {
      background: #21262d;
      border-color: #8b949e;
      color: #fff;
    }
    .copy-btn.copied {
      background: #238636;
      border-color: #2ea043;
      color: #ffffff;
    }
    .code-content :deep(pre) {
      margin: 0 !important;
      padding: 1.25rem 1rem !important;
      overflow-x: auto;
      font-size: 0.9rem;
      line-height: 1.6;
      font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }
    .code-content :deep(code) {
      font-family: inherit;
    }
    /* Màu comment cực kỳ nổi bật, dễ đọc */
    .code-content :deep(.line span[style*="color:#8B949E"]),
    .code-content :deep(.line span[style*="color:#8b949e"]),
    .code-content :deep(.line span[style*="color:#6A737D"]),
    .code-content :deep(.line span[style*="color:#6a737d"]),
    .code-content :deep(span.comment) {
      color: #38bdf8 !important; /* Xanh cyan tươi sáng, cực rõ ràng trên nền tối */
      font-style: italic;
      font-weight: 500;
    }
    .fallback-pre {
      margin: 0;
      padding: 1.25rem 1rem;
      overflow-x: auto;
      color: #e6edf3;
      font-size: 0.9rem;
      line-height: 1.6;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }
  `]
})
export class CodeBlock {
  block = input.required<{ file?: string; lang: string; code: string[] }>();
  text = computed(() => this.block().code.join('\n'));
  html = signal('');
  copied = signal(false);

  constructor() {
    effect(async () => {
      const code = this.text();
      let lang = this.block().lang || 'typescript';
      if (lang === 'ts') lang = 'typescript';
      if (lang === 'js') lang = 'javascript';

      try {
        const highlighter = await getHighlighter();
        let highlighted = highlighter.codeToHtml(code, {
          lang,
          theme: 'github-dark'
        });
        // Thay thế trực tiếp màu comment trong HTML do Shiki sinh ra (#8b949e / #6a737d) thành màu sáng rõ nét (#38bdf8)
        highlighted = highlighted
          .replace(/color:#8b949e/gi, 'color:#38bdf8; font-style:italic; font-weight:500')
          .replace(/color:#6a737d/gi, 'color:#38bdf8; font-style:italic; font-weight:500');
        this.html.set(highlighted);
      } catch (e) {
        const pre = `<pre class="shiki"><code>${code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`;
        this.html.set(pre);
      }
    });
  }

  async copy() {
    try {
      await navigator.clipboard.writeText(this.text());
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  }
}
