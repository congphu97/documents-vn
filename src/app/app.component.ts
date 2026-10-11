import { Component, signal, effect, inject } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { SidebarComponent } from './layout/sidebar.component';
import { DocService } from './doc.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, SidebarComponent],
  template: `
    <div class="app-container" [class.dark-theme]="isDark()" [class.light-theme]="!isDark()">
      <!-- Header -->
      <header class="app-header">
        <div class="header-left">
          <button class="mobile-menu-btn" (click)="toggleMobileMenu()" aria-label="Toggle menu">
            <span>☰</span>
          </button>
          <a routerLink="/docs/overview" class="logo">
            <span class="logo-symbol">▲</span>
            <span class="logo-text">Angular</span>
            <span class="logo-badge">{{ docService.currentLang() === 'vi' ? 'Tiếng Việt' : 'English' }}</span>
          </a>
        </div>

        <div class="header-right">
          <!-- Language Switcher Button (VI / EN) -->
          <div class="lang-switch-group">
            <button
              type="button"
              class="lang-btn"
              [class.active]="docService.currentLang() === 'vi'"
              (click)="switchLang('vi')"
            >
              🇻🇳 VI
            </button>
            <button
              type="button"
              class="lang-btn"
              [class.active]="docService.currentLang() === 'en'"
              (click)="switchLang('en')"
            >
              🇺🇸 EN
            </button>
          </div>

          <button class="theme-btn" (click)="toggleTheme()" [title]="isDark() ? 'Chuyển sang Giao diện sáng' : 'Chuyển sang Giao diện tối'">
            {{ isDark() ? '☀️ Sáng' : '🌙 Tối' }}
          </button>
          <a href="https://github.com/angular/angular" target="_blank" rel="noopener noreferrer" class="github-link">
            GitHub ↗
          </a>
        </div>
      </header>

      <!-- Main Layout -->
      <div class="main-layout">
        <!-- Sidebar Navigation -->
        <aside class="sidebar-wrapper" [class.open]="mobileMenuOpen()">
          <app-sidebar (linkClicked)="closeMobileMenu()" />
        </aside>

        @if (mobileMenuOpen()) {
          <div class="sidebar-backdrop" (click)="closeMobileMenu()"></div>
        }

        <!-- Main Content Area -->
        <main class="content-wrapper">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
    }
    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background: var(--bg-color, #0f172a);
      color: var(--text-color, #cbd5e1);
      transition: background 0.2s ease, color 0.2s ease;
    }
    .app-header {
      position: sticky;
      top: 0;
      z-index: 50;
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 4rem;
      padding: 0 1.5rem;
      background: var(--header-bg, rgba(15, 23, 42, 0.85));
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border-color, #1e293b);
    }
    .header-left, .header-right {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .mobile-menu-btn {
      display: none;
      background: transparent;
      border: 1px solid var(--border-color, #334155);
      color: var(--text-color, #e2e8f0);
      font-size: 1.25rem;
      padding: 0.35rem 0.65rem;
      border-radius: 6px;
      cursor: pointer;
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
      font-weight: 700;
      font-size: 1.2rem;
      color: var(--text-heading, #ffffff);
    }
    .logo-symbol {
      background: linear-gradient(135deg, #e535ab 0%, #ff4b4b 100%);
      color: #ffffff;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
      font-size: 0.85rem;
      font-weight: bold;
    }
    .logo-badge {
      background: rgba(229, 53, 171, 0.15);
      color: var(--primary-accent, #e535ab);
      font-size: 0.72rem;
      padding: 0.2rem 0.5rem;
      border-radius: 9999px;
      font-weight: 600;
      border: 1px solid rgba(229, 53, 171, 0.3);
    }

    /* Language Switcher Buttons */
    .lang-switch-group {
      display: flex;
      background: var(--card-bg, #1e293b);
      border: 1px solid var(--border-color, #334155);
      border-radius: 8px;
      padding: 2px;
      gap: 2px;
    }
    .lang-btn {
      background: transparent;
      border: none;
      color: var(--text-muted, #94a3b8);
      padding: 0.35rem 0.65rem;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .lang-btn:hover {
      color: var(--text-heading, #ffffff);
    }
    .lang-btn.active {
      background: var(--primary-accent, #e535ab);
      color: #ffffff;
      box-shadow: 0 2px 8px rgba(229, 53, 171, 0.3);
    }

    .theme-btn {
      background: var(--card-bg, #1e293b);
      border: 1px solid var(--border-color, #334155);
      color: var(--text-color, #e2e8f0);
      padding: 0.4rem 0.8rem;
      border-radius: 6px;
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.2s;
    }
    .theme-btn:hover {
      border-color: var(--primary-accent, #e535ab);
    }
    .github-link {
      color: var(--text-muted, #94a3b8);
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 500;
    }
    .github-link:hover {
      color: var(--text-heading, #ffffff);
    }
    .main-layout {
      flex: 1;
      display: flex;
      position: relative;
    }
    .sidebar-wrapper {
      width: 270px;
      flex-shrink: 0;
      border-right: 1px solid var(--border-color, #1e293b);
      position: sticky;
      top: 4rem;
      height: calc(100vh - 4rem);
      overflow-y: auto;
      background: var(--sidebar-bg, transparent);
      z-index: 30;
    }
    .content-wrapper {
      flex: 1;
      min-width: 0;
      position: relative;
      z-index: 10;
    }
    @media (max-width: 768px) {
      .mobile-menu-btn {
        display: block;
      }
      .sidebar-wrapper {
        position: fixed;
        left: -290px;
        top: 4rem;
        bottom: 0;
        width: 280px;
        height: auto;
        background: var(--bg-color, #0f172a);
        z-index: 60;
        transition: transform 0.25s ease-in-out;
        box-shadow: 4px 0 20px rgba(0,0,0,0.5);
      }
      .sidebar-wrapper.open {
        transform: translateX(290px);
      }
      .sidebar-backdrop {
        position: fixed;
        inset: 4rem 0 0 0;
        background: rgba(0,0,0,0.5);
        backdrop-filter: blur(2px);
        z-index: 55;
      }
    }
  `]
})
export class AppComponent {
  docService = inject(DocService);
  isDark = signal(true);
  mobileMenuOpen = signal(false);

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ng-docs-theme');
      if (saved) {
        this.isDark.set(saved === 'dark');
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        this.isDark.set(prefersDark);
      }
    }

    effect(() => {
      const dark = this.isDark();
      if (typeof window !== 'undefined') {
        localStorage.setItem('ng-docs-theme', dark ? 'dark' : 'light');
        if (dark) {
          document.documentElement.classList.add('dark-theme');
          document.documentElement.classList.remove('light-theme');
        } else {
          document.documentElement.classList.add('light-theme');
          document.documentElement.classList.remove('dark-theme');
        }
      }
    });
  }

  switchLang(lang: 'vi' | 'en') {
    this.docService.setLang(lang);
  }

  toggleTheme() {
    this.isDark.update((v) => !v);
  }

  toggleMobileMenu() {
    this.mobileMenuOpen.update((v) => !v);
  }

  closeMobileMenu() {
    this.mobileMenuOpen.set(false);
  }
}
