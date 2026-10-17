import { Component, inject, input, output, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar" [class.open]="open()">
      <div class="brand">
        @if (!logoFailed()) {
          <img class="brand-logo" [src]="env.logoUrl" [alt]="env.schoolName + ' logo'" (error)="logoFailed.set(true)" />
        } @else {
          <span class="brand-mark">{{ env.schoolShortName }}</span>
        }
        <span class="brand-name">{{ env.schoolName }}</span>
      </div>

      <nav class="nav">
        <div class="nav-label">Main</div>
        <a routerLink="/dashboard" routerLinkActive="active" (click)="navigate.emit()">
          <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
          Dashboard
        </a>
        <a routerLink="/students" [class.active]="studentsActive()" (click)="navigate.emit()">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
          Students
        </a>
        <a routerLink="/students/new" [class.active]="addActive()" (click)="navigate.emit()">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" /><path d="M12 8v8M8 12h8" /></svg>
          Add Student
        </a>

        <div class="nav-label">Academic</div>
        <a routerLink="/classes" routerLinkActive="active" (click)="navigate.emit()">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>
          Classes
        </a>
        <a routerLink="/courses" routerLinkActive="active" (click)="navigate.emit()">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
          Courses
        </a>

        <div class="nav-label">System</div>
        <a routerLink="/settings" routerLinkActive="active" (click)="navigate.emit()">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
          Settings
        </a>
      </nav>
    </aside>
  `,
})
export class SidebarComponent {
  readonly open = input(false);
  readonly navigate = output<void>();

  protected readonly env = environment;
  protected readonly logoFailed = signal(false);

  private readonly router = inject(Router);
  private readonly url = signal(this.router.url);

  constructor() {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => this.url.set(e.urlAfterRedirects));
  }

  // "Students" stays highlighted on the list, details and edit pages, but not on "Add Student"
  protected studentsActive(): boolean {
    const path = this.url().split('?')[0];
    return path.startsWith('/students') && path !== '/students/new';
  }

  protected addActive(): boolean {
    return this.url().split('?')[0] === '/students/new';
  }
}
