import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { DocPage, NavGroup } from './models';

@Injectable({
  providedIn: 'root'
})
export class DocService {
  private http = inject(HttpClient);
  currentLang = signal<'vi' | 'en'>('vi');

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ng-docs-lang') as 'vi' | 'en';
      if (saved === 'vi' || saved === 'en') {
        this.currentLang.set(saved);
      }
    }
  }

  setLang(lang: 'vi' | 'en') {
    this.currentLang.set(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ng-docs-lang', lang);
    }
  }

  page(slug: string): Observable<DocPage> {
    const cleanSlug = slug.replace(/^\/+/, '');
    const lang = this.currentLang();
    if (lang === 'en') {
      return this.http.get<DocPage>(`/content/en/${cleanSlug}.json`).pipe(
        catchError(() => {
          // Fallback to Vietnamese if English version doesn't exist yet
          return this.http.get<DocPage>(`/content/${cleanSlug}.json`);
        })
      );
    }
    return this.http.get<DocPage>(`/content/${cleanSlug}.json`);
  }

  nav(): Observable<NavGroup[]> {
    return this.http.get<NavGroup[]>('/content/nav.json');
  }
}
