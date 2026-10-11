import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CardItem } from '../models';
import { InlinePipe } from './inline.pipe';

@Component({
  selector: 'app-cards',
  standalone: true,
  imports: [RouterLink, InlinePipe],
  template: `
    <div class="cards-grid">
      @for (c of items(); track c.title) {
        <section class="card-item">
          <div class="card-body-content">
            <h3 class="card-title">{{ c.title }}</h3>
            <p class="card-body" [innerHTML]="c.body | inline"></p>
          </div>
          <div class="card-action">
            @if (c.href.startsWith('http')) {
              <a [href]="c.href" class="card-link" target="_blank" rel="noopener noreferrer">
                {{ c.link }}
                <span class="icon-external">↗</span>
              </a>
            } @else {
              <a [routerLink]="['/docs', c.href]" class="card-link">
                {{ c.link }}
                <span class="icon-arrow">→</span>
              </a>
            }
          </div>
        </section>
      }
    </div>
  `,
  styles: [`
    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.25rem;
      margin: 1.5rem 0;
    }
    .card-item {
      background: var(--card-bg, #1e1e28);
      border: 1px solid var(--border-color, #2d3142);
      border-radius: 12px;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
    }
    .card-item:hover {
      transform: translateY(-2px);
      border-color: var(--primary-accent, #e535ab);
      box-shadow: 0 8px 24px -6px rgba(229, 53, 171, 0.15);
    }
    .card-title {
      font-size: 1.15rem;
      font-weight: 600;
      margin: 0 0 0.5rem 0;
      color: var(--text-heading, #ffffff);
    }
    .card-body {
      font-size: 0.95rem;
      color: var(--text-muted, #94a3b8);
      line-height: 1.5;
      margin: 0;
    }
    .card-action {
      margin-top: 1.25rem;
    }
    .card-link {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--primary-accent, #e535ab);
      text-decoration: none;
      transition: gap 0.2s;
    }
    .card-link:hover {
      gap: 0.6rem;
      text-decoration: underline;
    }
    .icon-external, .icon-arrow {
      font-size: 0.9em;
    }
  `]
})
export class CardsBlock {
  items = input.required<CardItem[]>();
}
