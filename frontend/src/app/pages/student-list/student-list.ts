import { Component, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { Pagination, Student } from '../../core/models/student.model';
import { SettingsService } from '../../core/services/settings.service';
import { StudentService, apiErrorMessage } from '../../core/services/student.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog';

type FilterKey = 'search' | 'course' | 'class_name' | 'status';

@Component({
  selector: 'app-student-list',
  imports: [RouterLink, ReactiveFormsModule, ConfirmDialogComponent],
  template: `
    <section class="card">
      <div class="card-head">
        <h2>All students <span class="muted">({{ pagination().total }})</span></h2>
        <a routerLink="/students/new" class="btn btn-primary btn-sm">+ Add student</a>
      </div>

      <div class="filters">
        <label class="field-inline field-grow">
          <span>Search</span>
          <input type="search" [formControl]="searchCtrl" placeholder="ID, name, email, course or class" />
        </label>
        <label class="field-inline">
          <span>Course</span>
          <select [value]="course" (change)="setFilter('course', $any($event.target).value)">
            <option value="">All courses</option>
            @for (c of courses(); track c) {
              <option [value]="c" [selected]="c === course">{{ c }}</option>
            }
          </select>
        </label>
        <label class="field-inline">
          <span>Class</span>
          <select [value]="className" (change)="setFilter('class_name', $any($event.target).value)">
            <option value="">All classes</option>
            @for (c of classes(); track c) {
              <option [value]="c" [selected]="c === className">{{ c }}</option>
            }
          </select>
        </label>
        <label class="field-inline">
          <span>Status</span>
          <select [value]="status" (change)="setFilter('status', $any($event.target).value)">
            <option value="">All statuses</option>
            <option value="Active" [selected]="status === 'Active'">Active</option>
            <option value="Inactive" [selected]="status === 'Inactive'">Inactive</option>
          </select>
        </label>
        @if (search || course || className || status) {
          <button type="button" class="btn btn-ghost btn-sm" (click)="clearFilters()">Clear filters</button>
        }
      </div>

      @if (error()) {
        <div class="alert alert-error">
          <span>{{ error() }}</span>
          <button type="button" class="btn btn-ghost btn-sm" (click)="load()">Retry</button>
        </div>
      }

      @if (loading()) {
        <div class="state-box"><span class="spinner"></span> Loading students...</div>
      } @else if (!error()) {
        @if (students().length === 0) {
          <div class="empty">
            @if (search || course || className || status) {
              <p>No students match your search or filters.</p>
              <button type="button" class="btn btn-ghost" (click)="clearFilters()">Clear filters</button>
            } @else {
              <p>No students have been added yet.</p>
              <a routerLink="/students/new" class="btn btn-primary">Add your first student</a>
            }
          </div>
        } @else {
          <div class="table-wrap">
            <table class="table">
              <thead>
                <tr>
                  <th>Student ID</th><th>Name / Email</th><th>Course</th><th>Class</th><th>Year</th><th>Status</th><th class="right">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (s of students(); track s.id) {
                  <tr>
                    <td>{{ s.student_id }}</td>
                    <td><a class="link" [routerLink]="['/students', s.id]">{{ s.full_name }}</a><div class="cell-sub">{{ s.email }}</div></td>
                    <td class="wrap">{{ s.course }}</td>
                    <td>{{ s.class_name }}</td>
                    <td>{{ s.academic_year }}</td>
                    <td><span class="badge" [class.badge-active]="s.status === 'Active'" [class.badge-inactive]="s.status === 'Inactive'">{{ s.status }}</span></td>
                    <td class="right">
                      <div class="actions">
                        <a class="btn btn-ghost btn-sm" [routerLink]="['/students', s.id]">View</a>
                        <a class="btn btn-ghost btn-sm" [routerLink]="['/students', s.id, 'edit']">Edit</a>
                        <button type="button" class="btn btn-danger-ghost btn-sm" (click)="askDelete(s)">Delete</button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <div class="pager">
            <span class="muted">Page {{ pagination().page }} of {{ pagination().totalPages }} &middot; {{ pagination().total }} students</span>
            <div class="pager-btns">
              <button type="button" class="btn btn-ghost btn-sm" [disabled]="pagination().page <= 1" (click)="goToPage(pagination().page - 1)">Previous</button>
              <button type="button" class="btn btn-ghost btn-sm" [disabled]="pagination().page >= pagination().totalPages" (click)="goToPage(pagination().page + 1)">Next</button>
            </div>
          </div>
        }
      }
    </section>

    @if (toDelete(); as target) {
      <app-confirm-dialog
        title="Delete student?"
        [message]="'This will permanently delete ' + target.full_name + ' (' + target.student_id + '). This action cannot be undone.'"
        [busy]="deleting()"
        (confirmed)="confirmDelete()"
        (cancelled)="toDelete.set(null)"
      />
    }
  `,
})
export class StudentListPage implements OnInit {
  private readonly api = inject(StudentService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly settings = inject(SettingsService);

  protected readonly students = signal<Student[]>([]);
  protected readonly courses = signal<string[]>([]);
  protected readonly classes = signal<string[]>([]);
  protected readonly pagination = signal<Pagination>({ page: 1, limit: 10, total: 0, totalPages: 1 });
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly toDelete = signal<Student | null>(null);
  protected readonly deleting = signal(false);
  protected readonly searchCtrl = new FormControl('', { nonNullable: true });

  protected search = '';
  protected course = '';
  protected className = '';
  protected status = '';
  private page = 1;

  constructor() {
    // The URL is the single source of truth, so the header search box and this page stay in sync.
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((p) => {
      this.search = p.get('search') ?? '';
      this.course = p.get('course') ?? '';
      this.className = p.get('class_name') ?? '';
      this.status = p.get('status') ?? '';
      this.page = Math.max(Number(p.get('page')) || 1, 1);
      this.searchCtrl.setValue(this.search, { emitEvent: false });
      this.load();
    });

    this.searchCtrl.valueChanges
      .pipe(debounceTime(350), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((value) => this.setFilter('search', value.trim()));
  }

  ngOnInit(): void {
    this.loadOptions();
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.api
      .list({
        search: this.search,
        course: this.course,
        class_name: this.className,
        status: this.status,
        page: this.page,
        limit: this.settings.pageSize(),
      })
      .subscribe({
        next: (res) => {
          // The page may no longer exist (e.g. last row on it was deleted)
          if (res.data.length === 0 && res.pagination.total > 0 && this.page > res.pagination.totalPages) {
            this.goToPage(res.pagination.totalPages);
            return;
          }
          this.students.set(res.data);
          this.pagination.set(res.pagination);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(apiErrorMessage(err));
          this.loading.set(false);
        },
      });
  }

  private loadOptions(): void {
    this.api.courses().subscribe({ next: (res) => this.courses.set(res.data), error: () => this.courses.set([]) });
    this.api.classes().subscribe({ next: (res) => this.classes.set(res.data), error: () => this.classes.set([]) });
  }

  protected setFilter(key: FilterKey, value: string): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { [key]: value || null, page: null },
      queryParamsHandling: 'merge',
    });
  }

  protected clearFilters(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { search: null, course: null, class_name: null, status: null, page: null },
    });
  }

  protected goToPage(page: number): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: page > 1 ? page : null },
      queryParamsHandling: 'merge',
    });
  }

  protected askDelete(student: Student): void {
    this.toDelete.set(student);
  }

  protected confirmDelete(): void {
    const target = this.toDelete();
    if (!target) return;
    this.deleting.set(true);
    this.api.delete(target.id).subscribe({
      next: (res) => {
        this.deleting.set(false);
        this.toDelete.set(null);
        this.toast.success(res.message ?? 'Student deleted');
        this.loadOptions();
        this.load();
      },
      error: (err) => {
        this.deleting.set(false);
        this.toDelete.set(null);
        this.toast.error(apiErrorMessage(err));
      },
    });
  }
}
