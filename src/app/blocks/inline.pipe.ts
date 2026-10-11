import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'inline',
  standalone: true
})
export class InlinePipe implements PipeTransform {
  transform(src: string | undefined): string {
    if (!src) return '';
    return src
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
      .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="/docs/$2">$1</a>');
  }
}
