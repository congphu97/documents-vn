import { Component, inject, signal, output, computed } from '@angular/core';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs/operators';
import { DocService } from '../doc.service';
import { NavItem, NavGroup } from '../models';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink],
  template: `
    <nav class="sidebar-nav">
      @if (activeSubmenu()) {
        <!-- Sub-menu View with Back Arrow (chuẩn angular.dev) -->
        <div class="submenu-container">
          <button type="button" class="back-btn" (click)="closeSubmenu()" aria-label="Quay lại danh mục chính">
            <svg class="back-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            <span class="submenu-header-title">{{ activeSubmenu()!.label }}</span>
          </button>

          <ul class="submenu-list">
            @for (sub of activeSubmenu()!.children; track sub.label) {
              <li class="submenu-item">
                <a
                  [routerLink]="['/docs', sub.path]"
                  [class.is-active]="isActive(sub.path)"
                  class="submenu-link"
                  (click)="onLinkClick()"
                >
                  <span class="sub-label-text">{{ sub.label }}</span>
                  @if (sub.badge) {
                    <span class="nav-badge" [class]="'badge-' + sub.badge.toLowerCase()">{{ sub.badge }}</span>
                  }
                </a>
              </li>
            }
          </ul>
        </div>
      } @else {
        <!-- Main Sidebar View -->
        <div class="main-menu-container">
          @for (g of nav(); track g.label) {
            <div class="nav-group">
              <h4 class="group-title">{{ g.label }}</h4>
              <ul class="nav-list">
                @for (i of g.items; track i.label) {
                  <li class="nav-item">
                    @if (i.children && i.children.length > 0) {
                      <!-- Item has subtopics: click opens submenu view -->
                      <button
                        type="button"
                        class="nav-expand-btn"
                        (click)="openSubmenu(i)"
                      >
                        <div class="label-wrapper">
                          <span class="label-text">{{ i.label }}</span>
                          @if (i.badge) {
                            <span class="nav-badge" [class]="'badge-' + i.badge.toLowerCase()">{{ i.badge }}</span>
                          }
                        </div>
                        <svg
                          class="chevron-icon"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        >
                          <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                      </button>
                    } @else {
                      <!-- Single direct link -->
                      <a
                        [routerLink]="['/docs', i.path]"
                        [class.is-active]="isActive(i.path)"
                        class="nav-link"
                        (click)="onLinkClick()"
                      >
                        <span class="label-text">{{ i.label }}</span>
                        @if (i.badge) {
                          <span class="nav-badge" [class]="'badge-' + i.badge.toLowerCase()">{{ i.badge }}</span>
                        }
                      </a>
                    }
                  </li>
                }
              </ul>
            </div>
          }
        </div>
      }
    </nav>
  `,
  styles: [`
    .sidebar-nav {
      padding: 1.5rem 1rem 3rem 1.25rem;
    }
    .nav-group {
      margin-bottom: 2rem;
    }
    .group-title {
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--text-heading, #ffffff);
      margin: 0 0 0.85rem 0.5rem;
      letter-spacing: -0.01em;
    }
    .nav-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
      border-left: 2px solid var(--border-color, #232936);
    }
    .nav-item {
      position: relative;
    }
    .nav-link, .nav-expand-btn {
      width: 100%;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.5rem 0.75rem;
      border-radius: 6px;
      color: var(--text-muted, #94a3b8);
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 500;
      background: transparent;
      border: none;
      cursor: pointer;
      text-align: left;
      transition: all 0.15s ease-in-out;
    }
    .nav-link:hover, .nav-expand-btn:hover {
      color: var(--text-heading, #ffffff);
      background: var(--hover-bg, rgba(255, 255, 255, 0.05));
    }
    .nav-link.is-active {
      color: var(--primary-accent, #e535ab);
      background: var(--active-bg, rgba(229, 53, 171, 0.1));
      font-weight: 600;
    }
    .label-wrapper {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .label-text, .sub-label-text {
      line-height: 1.4;
    }
    .nav-badge {
      font-size: 0.7rem;
      font-weight: 600;
      padding: 0.1rem 0.4rem;
      border-radius: 4px;
      line-height: 1.2;
    }
    .badge-updated {
      background: rgba(59, 130, 246, 0.2);
      color: #60a5fa;
      border: 1px solid rgba(59, 130, 246, 0.3);
    }
    .badge-new {
      background: rgba(16, 185, 129, 0.2);
      color: #34d399;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }
    .chevron-icon {
      flex-shrink: 0;
      color: var(--text-muted, #94a3b8);
      transition: color 0.15s ease;
    }
    .nav-expand-btn:hover .chevron-icon {
      color: var(--primary-accent, #e535ab);
    }

    /* Submenu view with back arrow */
    .submenu-container {
      display: flex;
      flex-direction: column;
    }
    .back-btn {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: transparent;
      border: none;
      padding: 0.5rem 0.5rem 1.25rem 0.5rem;
      color: var(--text-heading, #ffffff);
      font-size: 1.15rem;
      font-weight: 700;
      cursor: pointer;
      border-bottom: 1px solid var(--border-color, #232936);
      margin-bottom: 1rem;
      transition: color 0.15s ease;
    }
    .back-btn:hover {
      color: var(--primary-accent, #e535ab);
    }
    .back-icon {
      stroke: currentColor;
    }
    .submenu-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      border-left: 2px solid var(--border-color, #232936);
    }
    .submenu-item {
      position: relative;
    }
    .submenu-link {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.5rem 0.75rem;
      border-radius: 6px;
      color: var(--text-muted, #94a3b8);
      text-decoration: none;
      font-size: 0.9rem;
      line-height: 1.4;
      background: transparent;
      transition: all 0.15s ease;
    }
    .submenu-link:hover {
      color: var(--text-heading, #ffffff);
      background: var(--hover-bg, rgba(255, 255, 255, 0.05));
    }
    /* Chỉ active khi exact match */
    .submenu-link.is-active {
      color: var(--primary-accent, #e535ab) !important;
      background: var(--active-bg, rgba(229, 53, 171, 0.12)) !important;
      font-weight: 600;
      border-left: 3px solid var(--primary-accent, #e535ab);
      margin-left: -2px;
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
    }
  `]
})
export class SidebarComponent {
  private router = inject(Router);
  nav = toSignal(inject(DocService).nav(), { initialValue: [] });
  activeSubmenu = signal<NavItem | null>(null);
  currentUrl = signal<string>(this.router.url);
  linkClicked = output<void>();

  constructor() {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => {
        this.currentUrl.set(e.urlAfterRedirects || e.url);
      });
  }

  isActive(path?: string): boolean {
    if (!path) return false;
    const cleanUrl = this.currentUrl().split('?')[0].split('#')[0];
    const targetUrl = `/docs/${path}`;
    return cleanUrl === targetUrl;
  }

  openSubmenu(item: NavItem) {
    this.activeSubmenu.set(item);
  }

  closeSubmenu() {
    this.activeSubmenu.set(null);
  }

  onLinkClick() {
    this.linkClicked.emit();
  }
}
