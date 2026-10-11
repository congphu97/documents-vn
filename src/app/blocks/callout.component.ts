import { Component, input } from '@angular/core';
import { InlinePipe } from './inline.pipe';

@Component({
  selector: 'app-callout',
  standalone: true,
  imports: [InlinePipe],
  template: `
    <aside [class]="'callout ' + kind()">
      <div class="callout-header">
        <span class="callout-badge">{{ label[kind()] }}</span>
      </div>
      <div class="callout-content" [innerHTML]="text() | inline"></div>
    </aside>
  `,
  styles: [`
    .callout {
      border-radius: 10px;
      padding: 1rem 1.25rem;
      margin: 1.5rem 0;
      border-left: 4px solid transparent;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .callout.tip {
      background: rgba(16, 185, 129, 0.1);
      border-left-color: #10b981;
    }
    .callout.note {
      background: rgba(59, 130, 246, 0.1);
      border-left-color: #3b82f6;
    }
    .callout.warning {
      background: rgba(245, 158, 11, 0.1);
      border-left-color: #f59e0b;
    }
    .callout-badge {
      font-size: 0.8rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .callout.tip .callout-badge { color: #10b981; }
    .callout.note .callout-badge { color: #3b82f6; }
    .callout.warning .callout-badge { color: #f59e0b; }
    .callout-content {
      font-size: 0.95rem;
      line-height: 1.55;
      color: var(--text-color, #e2e8f0);
    }
  `]
})
export class Callout {
  kind = input.required<'note' | 'tip' | 'warning'>();
  text = input.required<string>();

  readonly label = {
    note: 'Ghi chú',
    tip: 'Mẹo',
    warning: 'Cảnh báo'
  } as const;
}
