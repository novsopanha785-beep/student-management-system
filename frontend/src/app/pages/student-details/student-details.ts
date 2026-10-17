import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Student } from '../../core/models/student.model';
import { StudentService, apiErrorMessage } from '../../core/services/student.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog';

@Component({
  selector: 'app-student-details',
  imports: [RouterLink, DatePipe, ConfirmDialogComponent],
  template: `
    @if (loading()) {
      <div class="state-box"><span class="spinner"></span> Loading student...</div>
    } @else if (error()) {
      <div class="alert alert-error">
        <span>{{ error() }}</span>
        <a routerLink="/students" class="btn btn-ghost btn-sm">Back to students</a>
      </div>
    } @else if (student(); as s) {
      <section class="card">
        <div class="card-head">
          <div class="profile-head">
            <span class="avatar avatar-lg">{{ initials(s.full_name) }}</span>
            <div>
              <h2>{{ s.full_name }}</h2>
              <span class="muted">{{ s.student_id }}</span>
              <span class="badge" [class.badge-active]="s.status === 'Active'" [class.badge-inactive]="s.status === 'Inactive'">{{ s.status }}</span>
            </div>
          </div>
          <div class="actions">
            <a routerLink="/students" class="btn btn-ghost btn-sm">Back</a>
            <a [routerLink]="['/students', s.id, 'edit']" class="btn btn-primary btn-sm">Edit</a>
            <button type="button" class="btn btn-danger btn-sm" (click)="confirming.set(true)">Delete</button>
          </div>
        </div>

        <dl class="detail-grid">
          <div><dt>Student ID</dt><dd>{{ s.student_id }}</dd></div>
          <div><dt>Full name</dt><dd>{{ s.full_name }}</dd></div>
          <div><dt>Gender</dt><dd>{{ s.gender }}</dd></div>
          <div><dt>Date of birth</dt><dd>{{ s.date_of_birth | date: 'longDate' }}</dd></div>
          <div><dt>Email</dt><dd>{{ s.email }}</dd></div>
          <div><dt>Phone number</dt><dd>{{ s.phone }}</dd></div>
          <div><dt>Course / major</dt><dd>{{ s.course }}</dd></div>
          <div><dt>Academic year</dt><dd>Year {{ s.academic_year }}</dd></div>
          <div><dt>Class</dt><dd>{{ s.class_name }}</dd></div>
          <div><dt>Enrollment date</dt><dd>{{ s.enrollment_date | date: 'longDate' }}</dd></div>
          <div><dt>Status</dt><dd>{{ s.status }}</dd></div>
          <div class="wide"><dt>Address</dt><dd>{{ s.address }}</dd></div>
        </dl>
      </section>

      @if (confirming()) {
        <app-confirm-dialog
          title="Delete student?"
          [message]="'This will permanently delete ' + s.full_name + ' (' + s.student_id + '). This action cannot be undone.'"
          [busy]="deleting()"
          (confirmed)="remove(s)"
          (cancelled)="confirming.set(false)"
        />
      }
    }
  `,
})
export class StudentDetailsPage implements OnInit {
  private readonly api = inject(StudentService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected readonly student = signal<Student | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly confirming = signal(false);
  protected readonly deleting = signal(false);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.api.get(id).subscribe({
      next: (res) => {
        this.student.set(res.data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(apiErrorMessage(err));
        this.loading.set(false);
      },
    });
  }

  protected initials(name: string): string {
    return name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('');
  }

  protected remove(s: Student): void {
    this.deleting.set(true);
    this.api.delete(s.id).subscribe({
      next: (res) => {
        this.toast.success(res.message ?? 'Student deleted');
        this.router.navigate(['/students']);
      },
      error: (err) => {
        this.deleting.set(false);
        this.confirming.set(false);
        this.toast.error(apiErrorMessage(err));
      },
    });
  }
}
