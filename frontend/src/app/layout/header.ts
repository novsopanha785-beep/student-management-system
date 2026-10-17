import { Component, ElementRef, HostListener, inject, output, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-header',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <header class="topbar">
      <button type="button" class="icon-btn menu-btn" aria-label="Toggle menu" (click)="menuToggle.emit()">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
      </button>
      <h1 class="page-title">{{ title() }}</h1>

      <form class="search" role="search" (submit)="$event.preventDefault(); submitSearch()">
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
        <input type="search" [formControl]="search" placeholder="Search ID, name, course or class" aria-label="Search students" />
      </form>

      <div class="profile">
        <button type="button" class="avatar-btn" (click)="menuOpen.set(!menuOpen())" aria-haspopup="menu" [attr.aria-expanded]="menuOpen()">
          <span class="avatar">AD</span>
          <span class="avatar-name">Administrator</span>
        </button>
        @if (menuOpen()) {
          <div class="dropdown" role="menu">
            <a routerLink="/dashboard" role="menuitem" (click)="menuOpen.set(false)">Dashboard</a>
            <a routerLink="/students/new" role="menuitem" (click)="menuOpen.set(false)">Add student</a>
            <a routerLink="/settings" role="menuitem" (click)="menuOpen.set(false)">Settings</a>
          </div>
        }
      </div>
    </header>
  `,
})
export class HeaderComponent {
  readonly menuToggle = output<void>();

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly host = inject(ElementRef<HTMLElement>);

  protected readonly title = signal('Dashboard');
  protected readonly menuOpen = signal(false);
  protected readonly search = new FormControl('', { nonNullable: true });

  constructor() {
    this.router.events.pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd)).subscribe((e) => {
      let r = this.route.root;
      while (r.firstChild) r = r.firstChild;
      this.title.set((r.snapshot.data['title'] as string) ?? 'Student Management');

      const q = this.router.parseUrl(e.urlAfterRedirects).queryParams['search'];
      this.search.setValue(typeof q === 'string' ? q : '', { emitEvent: false });
    });
  }

  protected submitSearch(): void {
    const value = this.search.value.trim();
    this.router.navigate(['/students'], { queryParams: { search: value || null, page: null } });
  }

  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: Event): void {
    if (this.menuOpen() && !this.host.nativeElement.querySelector('.profile')?.contains(event.target as Node)) {
      this.menuOpen.set(false);
    }
  }
}
