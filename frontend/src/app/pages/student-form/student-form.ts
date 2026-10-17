import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { StudentPayload } from '../../core/models/student.model';
import { StudentService, apiErrorMessage } from '../../core/services/student.service';
import { ToastService } from '../../core/services/toast.service';

const LABELS: Record<string, string> = {
  student_id: 'Student ID',
  full_name: 'Full name',
  gender: 'Gender',
  date_of_birth: 'Date of birth',
  email: 'Email',
  phone: 'Phone number',
  course: 'Course / major',
  academic_year: 'Academic year',
  class_name: 'Class',
  address: 'Address',
  enrollment_date: 'Enrollment date',
  status: 'Status',
};

function notInFuture(control: AbstractControl): ValidationErrors | null {
  const v = control.value as string;
  return v && v > new Date().toISOString().slice(0, 10) ? { future: true } : null;
}

@Component({
  selector: 'app-student-form',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    @if (loading()) {
      <div class="state-box"><span class="spinner"></span> Loading student...</div>
    } @else if (loadError()) {
      <div class="alert alert-error">
        <span>{{ loadError() }}</span>
        <a routerLink="/students" class="btn btn-ghost btn-sm">Back to students</a>
      </div>
    } @else {
      <form class="card" [formGroup]="form" (ngSubmit)="submit()" novalidate>
        <div class="card-head">
          <h2>{{ isEdit ? 'Edit student' : 'New student' }}</h2>
        </div>

        @if (submitError()) {
          <div class="alert alert-error"><span>{{ submitError() }}</span></div>
        }

        <div class="form-grid">
          <div class="field">
            <label for="student_id">Student ID</label>
            <input id="student_id" formControlName="student_id" placeholder="e.g. STU-0009" [class.invalid]="errorText('student_id')" />
            @if (errorText('student_id'); as e) { <small class="error">{{ e }}</small> }
          </div>

          <div class="field">
            <label for="full_name">Full name</label>
            <input id="full_name" formControlName="full_name" [class.invalid]="errorText('full_name')" />
            @if (errorText('full_name'); as e) { <small class="error">{{ e }}</small> }
          </div>

          <div class="field">
            <label for="gender">Gender</label>
            <select id="gender" formControlName="gender" [class.invalid]="errorText('gender')">
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            @if (errorText('gender'); as e) { <small class="error">{{ e }}</small> }
          </div>

          <div class="field">
            <label for="date_of_birth">Date of birth</label>
            <input id="date_of_birth" type="date" formControlName="date_of_birth" [class.invalid]="errorText('date_of_birth')" />
            @if (errorText('date_of_birth'); as e) { <small class="error">{{ e }}</small> }
          </div>

          <div class="field">
            <label for="email">Email</label>
            <input id="email" type="email" formControlName="email" [class.invalid]="errorText('email')" />
            @if (errorText('email'); as e) { <small class="error">{{ e }}</small> }
          </div>

          <div class="field">
            <label for="phone">Phone number</label>
            <input id="phone" type="tel" formControlName="phone" placeholder="+855 12 345 678" [class.invalid]="errorText('phone')" />
            @if (errorText('phone'); as e) { <small class="error">{{ e }}</small> }
          </div>

          <div class="field">
            <label for="course">Course / major</label>
            <input id="course" list="course-options" formControlName="course" [class.invalid]="errorText('course')" />
            <datalist id="course-options">
              @for (c of courses(); track c) { <option [value]="c"></option> }
            </datalist>
            @if (errorText('course'); as e) { <small class="error">{{ e }}</small> }
          </div>

          <div class="field">
            <label for="academic_year">Academic year</label>
            <select id="academic_year" formControlName="academic_year" [class.invalid]="errorText('academic_year')">
              <option [ngValue]="null">Select year</option>
              @for (y of years; track y) { <option [ngValue]="y">Year {{ y }}</option> }
            </select>
            @if (errorText('academic_year'); as e) { <small class="error">{{ e }}</small> }
          </div>

          <div class="field">
            <label for="class_name">Class</label>
            <input id="class_name" list="class-options" formControlName="class_name" placeholder="e.g. CS-2A" [class.invalid]="errorText('class_name')" />
            <datalist id="class-options">
              @for (c of classes(); track c) { <option [value]="c"></option> }
            </datalist>
            @if (errorText('class_name'); as e) { <small class="error">{{ e }}</small> }
          </div>

          <div class="field">
            <label for="enrollment_date">Enrollment date</label>
            <input id="enrollment_date" type="date" formControlName="enrollment_date" [class.invalid]="errorText('enrollment_date')" />
            @if (errorText('enrollment_date'); as e) { <small class="error">{{ e }}</small> }
          </div>

          <div class="field">
            <label for="status">Status</label>
            <select id="status" formControlName="status" [class.invalid]="errorText('status')">
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            @if (errorText('status'); as e) { <small class="error">{{ e }}</small> }
          </div>

          <div class="field field-wide">
            <label for="address">Address</label>
            <textarea id="address" rows="2" formControlName="address" [class.invalid]="errorText('address')"></textarea>
            @if (errorText('address'); as e) { <small class="error">{{ e }}</small> }
          </div>
        </div>

        <div class="form-actions">
          <a routerLink="/students" class="btn btn-ghost">Cancel</a>
          <button type="submit" class="btn btn-primary" [disabled]="saving()">
            @if (saving()) { <span class="spinner spinner-sm"></span> Saving... } @else { {{ isEdit ? 'Save changes' : 'Create student' }} }
          </button>
        </div>
      </form>
    }
  `,
})
export class StudentFormPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(StudentService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected readonly years = [1, 2, 3, 4, 5, 6];
  protected readonly courses = signal<string[]>([]);
  protected readonly classes = signal<string[]>([]);
  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly loadError = signal<string | null>(null);
  protected readonly submitError = signal<string | null>(null);

  protected isEdit = false;
  private studentPk = 0;

  protected readonly form = this.fb.group({
    student_id: ['', [Validators.required, Validators.maxLength(30)]],
    full_name: ['', [Validators.required, Validators.maxLength(120)]],
    gender: ['', [Validators.required]],
    date_of_birth: ['', [Validators.required, notInFuture]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
    phone: ['', [Validators.required, Validators.pattern(/^[0-9+()\-\s]{6,30}$/)]],
    course: ['', [Validators.required, Validators.maxLength(100)]],
    academic_year: this.fb.control<number | null>(null, [Validators.required, Validators.min(1), Validators.max(8)]),
    class_name: ['', [Validators.required, Validators.maxLength(50)]],
    address: ['', [Validators.required, Validators.maxLength(255)]],
    enrollment_date: ['', [Validators.required]],
    status: ['Active', [Validators.required]],
  });

  ngOnInit(): void {
    this.api.courses().subscribe({ next: (r) => this.courses.set(r.data), error: () => this.courses.set([]) });
    this.api.classes().subscribe({ next: (r) => this.classes.set(r.data), error: () => this.classes.set([]) });

    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      // Coming from the Classes / Courses pages: pre-fill the chosen class or course
      const q = this.route.snapshot.queryParamMap;
      this.form.patchValue({ class_name: q.get('class_name') ?? '', course: q.get('course') ?? '' });
    }
    if (id) {
      this.isEdit = true;
      this.studentPk = Number(id);
      this.loading.set(true);
      this.api.get(this.studentPk).subscribe({
        next: (res) => {
          const { id: _id, created_at, updated_at, ...rest } = res.data;
          this.form.patchValue(rest);
          this.loading.set(false);
        },
        error: (err) => {
          this.loadError.set(apiErrorMessage(err));
          this.loading.set(false);
        },
      });
    }
  }

  protected errorText(name: string): string | null {
    const c = this.form.get(name);
    if (!c || !c.errors || !(c.touched || c.dirty)) return null;
    const label = LABELS[name] ?? name;
    const e = c.errors;
    if (e['server']) return e['server'];
    if (e['required']) return `${label} is required`;
    if (e['email']) return 'Enter a valid email address';
    if (e['pattern']) return 'Enter a valid phone number (digits, spaces, +, -, parentheses; 6-30 characters)';
    if (e['maxlength']) return `${label} must be at most ${e['maxlength'].requiredLength} characters`;
    if (e['min'] || e['max']) return 'Academic year must be between 1 and 8';
    if (e['future']) return `${label} cannot be in the future`;
    return `${label} is invalid`;
  }

  protected submit(): void {
    this.submitError.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const payload = this.form.getRawValue() as StudentPayload;
    const request$ = this.isEdit ? this.api.update(this.studentPk, payload) : this.api.create(payload);

    this.saving.set(true);
    request$.subscribe({
      next: (res) => {
        this.saving.set(false);
        this.toast.success(res.message ?? 'Saved');
        this.router.navigate(['/students']);
      },
      error: (err) => {
        this.saving.set(false);
        this.applyServerErrors(err);
      },
    });
  }

  /** Shows server-side validation / duplicate errors next to the matching fields. */
  private applyServerErrors(err: unknown): void {
    const fieldErrors = err instanceof HttpErrorResponse ? (err.error?.errors as Record<string, string> | undefined) : undefined;
    let matched = false;
    if (fieldErrors) {
      for (const [field, message] of Object.entries(fieldErrors)) {
        const control = this.form.get(field);
        if (control) {
          control.setErrors({ server: message });
          control.markAsTouched();
          matched = true;
        }
      }
    }
    this.submitError.set(matched ? 'Please fix the highlighted fields.' : apiErrorMessage(err));
  }
}
