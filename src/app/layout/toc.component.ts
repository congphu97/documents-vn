import { Component, input } from '@angular/core';

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

@Component({
  selector: 'app-toc',
  standalone: true,
  template: `
    @if (items().length > 0) {
      <aside class="toc-container">
        <h4 class="toc-title">TRÊN TRANG NÀY</h4>
        <ul class="toc-list">
          @for (item of items(); track item.id) {
            <li class="toc-item" [class.toc-h3]="item.level === 3">
              <a [href]="'#' + item.id" (click)="scrollTo($event, item.id)" class="toc-link">
                {{ item.text }}
              </a>
            </li>
          }
        </ul>
      </aside>
    }
  `,
  styles: [`
    .toc-container {
      padding: 1.5rem 1rem;
      position: sticky;
      top: 5rem;
      max-height: calc(100vh - 6rem);
      overflow-y: auto;
    }
    .toc-title {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--text-muted, #94a3b8);
      font-weight: 700;
      margin: 0 0 1rem 0;
    }
    .toc-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      border-left: 1px solid var(--border-color, #2d3142);
    }
    .toc-item {
      padding-left: 1rem;
      position: relative;
    }
    .toc-item.toc-h3 {
      padding-left: 1.75rem;
      font-size: 0.85rem;
    }
    .toc-link {
      color: var(--text-muted, #94a3b8);
      text-decoration: none;
      font-size: 0.88rem;
      line-height: 1.4;
      display: block;
      transition: color 0.15s ease;
    }
    .toc-link:hover {
      color: var(--primary-accent, #e535ab);
    }
  `]
})
export class TocComponent {
  items = input<TocItem[]>([]);

  scrollTo(event: Event, id: string) {
    event.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.pushState(null, '', `#${id}`);
    }
  }
}
