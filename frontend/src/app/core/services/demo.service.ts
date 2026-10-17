import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, DemoStatus } from '../models/student.model';

/** Knows whether the backend runs in public "demo mode" (see backend DEMO_MODE). */
@Injectable({ providedIn: 'root' })
export class DemoService {
  private readonly http = inject(HttpClient);
  readonly status = signal<DemoStatus | null>(null);

  load(): void {
    this.http.get<ApiResponse<DemoStatus>>(`${environment.apiUrl}/demo/status`).subscribe({
      next: (res) => this.status.set(res.data),
      error: () => this.status.set(null), // backend down: the pages show their own error
    });
  }

  reset(): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(`${environment.apiUrl}/demo/reset`, {});
  }
}
