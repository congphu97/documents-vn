import { Component, computed, effect, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, switchMap, catchError, startWith } from 'rxjs/operators';
import { of, combineLatest } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import { DocService } from './doc.service';
import { CardsBlock } from './blocks/cards.component';
import { CodeBlock } from './blocks/code-block.component';
import { Callout } from './blocks/callout.component';
import { InlinePipe } from './blocks/inline.pipe';
import { TocComponent, TocItem } from './layout/toc.component';
import { DocPage as DocPageModel } from './models';

@Component({
  selector: 'app-doc-page',
  standalone: true,
  imports: [CardsBlock, CodeBlock, Callout, InlinePipe, TocComponent],
  template: `
    @if (page(); as p) {
      <div class="doc-layout">
        <article class="doc-article">
          <header class="page-header">
            <h1 class="page-title">{{ p.title }}</h1>
            @if (p.description) {
              <p class="page-desc">{{ p.description }}</p>
            }
          </header>

          <div class="doc-blocks">
            @for (b of p.blocks; track $index) {
              @switch (b.type) {
                @case ('heading') {
                  @if ($any(b).level === 2) {
                    <h2 [id]="$any(b).id" class="doc-h2">
                      <a [href]="'#' + $any(b).id" class="anchor-link">#</a>
                      {{ $any(b).text }}
                    </h2>
                  } @else if ($any(b).level === 3) {
                    <h3 [id]="$any(b).id" class="doc-h3">
                      <a [href]="'#' + $any(b).id" class="anchor-link">#</a>
                      {{ $any(b).text }}
                    </h3>
                  } @else {
                    <h4 [id]="$any(b).id" class="doc-h4">
                      <a [href]="'#' + $any(b).id" class="anchor-link">#</a>
                      {{ $any(b).text }}
                    </h4>
                  }
                }
                @case ('paragraph') {
                  <p class="doc-paragraph" [innerHTML]="$any(b).text | inline"></p>
                }
                @case ('list') {
                  <ul class="doc-list">
                    @for (t of $any(b).items; track $index) {
                      <li [innerHTML]="t | inline"></li>
                    }
                  </ul>
                }
                @case ('cards') {
                  <app-cards [items]="$any(b).items" />
                }
                @case ('code') {
                  <app-code-block [block]="$any(b)" />
                }
                @case ('callout') {
                  <app-callout [kind]="$any(b).kind" [text]="$any(b).text" />
                }
                @case ('table') {
                  <div class="table-container">
                    <table class="doc-table">
                      <thead>
                        <tr>
                          @for (h of $any(b).headers; track h) {
                            <th>{{ h }}</th>
                          }
                        </tr>
                      </thead>
                      <tbody>
                        @for (row of $any(b).rows; track $index) {
                          <tr>
                            @for (cell of row; track $index) {
                              <td [innerHTML]="cell | inline"></td>
                            }
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                }
                @case ('links') {
                  <ul class="doc-link-list">
                    @for (l of $any(b).items; track l.href) {
                      <li>
                        <a [href]="l.href" target="_blank" rel="noopener noreferrer">
                          {{ l.text }} <span class="external-icon">↗</span>
                        </a>
                      </li>
                    }
                  </ul>
                }
              }
            }
          </div>

          <footer class="doc-footer">
            <div class="footer-divider"></div>
            <p>
              Bản dịch từ tài liệu chính thức
              <a [href]="p.source" target="_blank" rel="noopener noreferrer">{{ p.source }}</a>.
              Nội dung gốc © Google, giấy phép CC BY 4.0. Code ví dụ theo giấy phép MIT.
            </p>
          </footer>
        </article>

        <div class="toc-column">
          <app-toc [items]="toc()" />
        </div>
      </div>
    } @else {
      <div class="loading-state">
        <p>Đang tải tài liệu...</p>
      </div>
    }
  `,
  styles: [`
    .doc-layout {
      display: flex;
      gap: 2.5rem;
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1.5rem 5rem 1.5rem;
    }
    .doc-article {
      flex: 1;
      min-width: 0;
    }
    .toc-column {
      width: 240px;
      flex-shrink: 0;
      display: none;
    }
    @media (min-width: 1080px) {
      .toc-column {
        display: block;
      }
    }
    .page-header {
      margin-bottom: 2.5rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid var(--border-color, #2d3142);
    }
    .page-title {
      font-size: 2.5rem;
      font-weight: 800;
      letter-spacing: -0.025em;
      margin: 0 0 0.75rem 0;
      color: var(--text-heading, #ffffff);
      background: linear-gradient(135deg, #fff 40%, var(--primary-accent, #e535ab) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .page-desc {
      font-size: 1.2rem;
      color: var(--text-muted, #94a3b8);
      margin: 0;
      line-height: 1.5;
    }
    .doc-h2 {
      font-size: 1.75rem;
      font-weight: 700;
      margin: 2.5rem 0 1rem 0;
      color: var(--text-heading, #ffffff);
      scroll-margin-top: 5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .doc-h3 {
      font-size: 1.3rem;
      font-weight: 600;
      margin: 2rem 0 0.75rem 0;
      color: var(--text-heading, #ffffff);
      scroll-margin-top: 5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .doc-h4 {
      font-size: 1.1rem;
      font-weight: 600;
      margin: 1.5rem 0 0.5rem 0;
      color: var(--text-heading, #ffffff);
      scroll-margin-top: 5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .anchor-link {
      color: var(--primary-accent, #e535ab);
      text-decoration: none;
      opacity: 0.2;
      transition: opacity 0.2s;
      font-size: 0.85em;
    }
    .doc-h2:hover .anchor-link,
    .doc-h3:hover .anchor-link,
    .doc-h4:hover .anchor-link {
      opacity: 1;
    }
    .doc-paragraph {
      font-size: 1.05rem;
      line-height: 1.75;
      color: var(--text-color, #cbd5e1);
      margin: 1.25rem 0;
    }
    .doc-list {
      margin: 1.25rem 0 1.5rem 1.5rem;
      color: var(--text-color, #cbd5e1);
      font-size: 1.05rem;
      line-height: 1.8;
    }

    /* Table styling matching angular.dev */
    .table-container {
      margin: 1.5rem 0;
      overflow-x: auto;
      border: 1px solid var(--border-color, #2d3142);
      border-radius: 8px;
    }
    .doc-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.95rem;
      text-align: left;
    }
    .doc-table th {
      background: var(--card-bg, #1a202c);
      padding: 0.75rem 1.25rem;
      font-weight: 600;
      color: var(--text-heading, #ffffff);
      border-bottom: 2px solid var(--border-color, #2d3142);
    }
    .doc-table td {
      padding: 0.85rem 1.25rem;
      border-bottom: 1px solid var(--border-color, #2d3142);
      color: var(--text-color, #cbd5e1);
      line-height: 1.5;
    }
    .doc-table tr:last-child td {
      border-bottom: none;
    }

    .doc-link-list {
      margin: 1rem 0 1.5rem 1.5rem;
      font-size: 1.05rem;
      line-height: 1.8;
    }
    .doc-link-list a {
      color: var(--primary-accent, #e535ab);
      text-decoration: none;
    }
    .doc-link-list a:hover {
      text-decoration: underline;
    }
    .external-icon {
      font-size: 0.85em;
    }
    .doc-footer {
      margin-top: 4rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--border-color, #2d3142);
      font-size: 0.88rem;
      color: var(--text-muted, #64748b);
      line-height: 1.6;
    }
    .doc-footer a {
      color: var(--text-muted, #94a3b8);
      text-decoration: underline;
    }
    .loading-state {
      padding: 4rem 2rem;
      text-align: center;
      color: var(--text-muted, #94a3b8);
    }
  `]
})
export class DocPageComponent {
  private router = inject(Router);
  private docs = inject(DocService);
  private titleService = inject(Title);

  private url$ = this.router.events.pipe(
    filter((e) => e instanceof NavigationEnd),
    startWith(null),
    map(() => {
      const url = this.router.url.split('?')[0].split('#')[0];
      let match = url.replace(/^\/docs\/?/, '');
      if (match.startsWith('en/')) {
        match = match.replace(/^en\//, '');
      }
      return match || 'overview';
    })
  );

  private lang$ = toObservable(this.docs.currentLang);

  page = toSignal(
    combineLatest([this.url$, this.lang$]).pipe(
      switchMap(([slug]) =>
        this.docs.page(slug).pipe(
          catchError((err) => {
            console.error('Error loading page:', slug, err);
            return of(null as DocPageModel | null);
          })
        )
      )
    ),
    { initialValue: null }
  );

  toc = computed<TocItem[]>(() => {
    const p = this.page();
    if (!p?.blocks) return [];
    return p.blocks
      .filter((b) => b.type === 'heading')
      .map((b: any) => ({
        id: b.id,
        text: b.text,
        level: b.level
      }));
  });

  constructor() {
    effect(() => {
      const p = this.page();
      if (p) {
        this.titleService.setTitle(`${p.title} • Angular`);
      } else {
        this.titleService.setTitle('Angular Docs');
      }
    });
  }
}
