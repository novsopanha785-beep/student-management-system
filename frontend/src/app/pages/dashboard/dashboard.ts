import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DashboardStats } from '../../core/models/student.model';
import { StudentService, apiErrorMessage } from '../../core/services/student.service';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, DatePipe],
  template: `
    @if (loading()) {
      <div class="state-box"><span class="spinner"></span> Loading dashboard...</div>
    } @else if (error()) {
      <div class="alert alert-error">
        <span>{{ error() }}</span>
        <button type="button" class="btn btn-ghost btn-sm" (click)="load()">Retry</button>
      </div>
    } @else if (stats(); as s) {
      <section class="stat-grid">
        <div class="card stat">
          <span class="stat-label">Total students</span>
          <span class="stat-value">{{ s.totalStudents }}</span>
        </div>
        <div class="card stat">
          <span class="stat-label">Active students</span>
          <span class="stat-value accent-green">{{ s.activeStudents }}</span>
        </div>
        <div class="card stat">
          <span class="stat-label">Inactive students</span>
          <span class="stat-value accent-gray">{{ s.inactiveStudents }}</span>
        </div>
        <a class="card stat stat-link" routerLink="/classes">
          <span class="stat-label">Classes</span>
          <span class="stat-value">{{ s.totalClasses }}</span>
        </a>
        <a class="card stat stat-link" routerLink="/courses">
          <span class="stat-label">Courses</span>
          <span class="stat-value">{{ s.totalCourses }}</span>
        </a>
        <div class="card stat">
          <span class="stat-label">Active rate</span>
          <span class="stat-value">{{ activeRate() }}%</span>
          <div class="meter" aria-hidden="true"><div class="meter-fill" [style.width.%]="activeRate()"></div></div>
        </div>
      </section>

      <section class="card">
        <div class="card-head">
          <h2>Recently added students</h2>
          <a routerLink="/students/new" class="btn btn-primary btn-sm">+ Add student</a>
        </div>
        @if (s.recentStudents.length === 0) {
          <div class="empty">
            <p>No students yet.</p>
            <a routerLink="/students/new" class="btn btn-primary">Add your first student</a>
          </div>
        } @else {
          <div class="table-wrap">
            <table class="table">
              <thead>
                <tr><th>Student ID</th><th>Name</th><th>Course</th><th>Class</th><th>Enrolled</th><th>Status</th></tr>
              </thead>
              <tbody>
                @for (st of s.recentStudents; track st.id) {
                  <tr>
                    <td>{{ st.student_id }}</td>
                    <td><a class="link" [routerLink]="['/students', st.id]">{{ st.full_name }}</a></td>
                    <td>{{ st.course }}</td>
                    <td>{{ st.class_name }}</td>
                    <td>{{ st.enrollment_date | date: 'mediumDate' }}</td>
                    <td><span class="badge" [class.badge-active]="st.status === 'Active'" [class.badge-inactive]="st.status === 'Inactive'">{{ st.status }}</span></td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </section>
    }
  `,
})
export class DashboardPage implements OnInit {
  private readonly students = inject(StudentService);

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly stats = signal<DashboardStats | null>(null);
  protected readonly activeRate = computed(() => {
    const s = this.stats();
    return s && s.totalStudents > 0 ? Math.round((s.activeStudents / s.totalStudents) * 100) : 0;
  });

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.students.dashboardStats().subscribe({
      next: (res) => {
        this.stats.set(res.data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(apiErrorMessage(err));
        this.loading.set(false);
      },
    });
  }
}
