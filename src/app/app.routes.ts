import { Routes } from '@angular/router';
import { DocPageComponent } from './doc-page.component';

export const routes: Routes = [
  { path: '', redirectTo: 'docs/overview', pathMatch: 'full' },
  { path: 'docs', children: [{ path: '**', component: DocPageComponent }] }
];
