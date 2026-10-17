import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { SummaryItem } from '../../core/models/student.model';
import { StudentService, apiErrorMessage } from '../../core/services/student.service';

/** Shared overview page: one card per class (route /classes) or per course (route /courses). */
@Component({
  selector: 'app-catalog',
  imports: [RouterLink],
  template: `
    <section class="card">
      <div class="card-head">
        <h2>All {{ plural }} <span class="muted">({{ filtered().length }})</span></h2>
        <a routerLink="/students/new" class="btn btn-primary btn-sm">+ Add student</a>
      </div>

      <div class="filters">
        <label class="field-inline">
          <span>Find a {{ singular }}</span>
          <input type="search" [value]="term()" (input)="term.set($any($event.target).value)" [placeholder]="'Type a ' + singular + ' name'" />
        </label>
      </div>

      @if (error()) {
        <div class="alert alert-error">
          <span>{{ error() }}</span>
          <button type="button" class="btn btn-ghost btn-sm" (click)="load()">Retry</button>
        </div>
      }

      @if (loading()) {
        <div class="state-box"><span class="spinner"></span> Loading {{ plural }}...</div>
      } @else if (!error()) {
        @if (filtered().length === 0) {
          <div class="empty">
            @if (items().length === 0) {
              <p>No {{ plural }} yet. {{ plural[0].toUpperCase() + plural.slice(1) }} appear here after you add students.</p>
              <a routerLink="/students/new" class="btn btn-primary">Add a student</a>
            } @else {
              <p>No {{ singular }} matches "{{ term() }}".</p>
            }
          </div>
        } @else {
          <div class="summary-grid">
            @for (item of filtered(); track item.name) {
              <article class="summary-card">
                <h3>{{ item.name }}</h3>
                <div class="summary-total">{{ item.total }} <span class="muted">{{ item.total === 1 ? 'student' : 'students' }}</span></div>
                <div class="meter" aria-hidden="true">
                  <div class="meter-fill" [style.width.%]="item.total ? (item.active / item.total) * 100 : 0"></div>
                </div>
                <div class="summary-badges">
                  <span class="badge badge-active">{{ item.active }} active</span>
                  <span class="badge badge-inactive">{{ item.inactive }} inactive</span>
                </div>
                <div class="summary-actions">
                  <a class="btn btn-ghost btn-sm" routerLink="/students" [queryParams]="query(item.name)">View students</a>
                  <a class="btn btn-ghost btn-sm" routerLink="/students/new" [queryParams]="query(item.name)">Add student</a>
                </div>
              </article>
            }
          </div>
        }
      }
    </section>
  `,
})
export class CatalogPage {
  private readonly api = inject(StudentService);
  private readonly route = inject(ActivatedRoute);

  private readonly kind = toSignal(this.route.data.pipe(map((d) => d['kind'] as 'class' | 'course')), {
    initialValue: 'class' as 'class' | 'course',
  });

  protected readonly items = signal<SummaryItem[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly term = signal('');
  protected readonly filtered = computed(() => {
    const t = this.term().trim().toLowerCase();
    return t ? this.items().filter((i) => i.name.toLowerCase().includes(t)) : this.items();
  });

  protected get singular(): string {
    return this.kind();
  }
  protected get plural(): string {
    return this.kind() === 'class' ? 'classes' : 'courses';
  }

  constructor() {
    this.load();
  }

  protected query(name: string): Record<string, string> {
    return this.kind() === 'class' ? { class_name: name } : { course: name };
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.api.summary(this.kind()).subscribe({
      next: (res) => {
        this.items.set(res.data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(apiErrorMessage(err));
        this.loading.set(false);
      },
    });
  }
}
