import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  DashboardStats,
  PaginatedResponse,
  Student,
  StudentPayload,
  StudentQuery,
  SummaryItem,
} from '../models/student.model';

@Injectable({ providedIn: 'root' })
export class StudentService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/students`;

  list(query: StudentQuery): Observable<PaginatedResponse<Student>> {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    }
    return this.http.get<PaginatedResponse<Student>>(this.base, { params });
  }

  courses(): Observable<ApiResponse<string[]>> {
    return this.http.get<ApiResponse<string[]>>(`${this.base}/courses`);
  }

  classes(): Observable<ApiResponse<string[]>> {
    return this.http.get<ApiResponse<string[]>>(`${this.base}/classes`);
  }

  summary(kind: 'class' | 'course'): Observable<ApiResponse<SummaryItem[]>> {
    return this.http.get<ApiResponse<SummaryItem[]>>(`${environment.apiUrl}/${kind === 'class' ? 'classes' : 'courses'}`);
  }

  get(id: number): Observable<ApiResponse<Student>> {
    return this.http.get<ApiResponse<Student>>(`${this.base}/${id}`);
  }

  create(payload: StudentPayload): Observable<ApiResponse<Student>> {
    return this.http.post<ApiResponse<Student>>(this.base, payload);
  }

  update(id: number, payload: StudentPayload): Observable<ApiResponse<Student>> {
    return this.http.put<ApiResponse<Student>>(`${this.base}/${id}`, payload);
  }

  delete(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.base}/${id}`);
  }

  dashboardStats(): Observable<ApiResponse<DashboardStats>> {
    return this.http.get<ApiResponse<DashboardStats>>(`${environment.apiUrl}/dashboard/stats`);
  }
}

/** Turns an HttpErrorResponse into a message that is safe to show to the user. */
export function apiErrorMessage(err: unknown): string {
  if (err instanceof HttpErrorResponse) {
    if (err.status === 0) {
      return 'Cannot reach the server. Make sure the backend API is running.';
    }
    const msg = err.error && typeof err.error === 'object' ? err.error.message : null;
    if (msg) return msg;
    return `Request failed (${err.status} ${err.statusText}).`;
  }
  return 'Something went wrong. Please try again.';
}
