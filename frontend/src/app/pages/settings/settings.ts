import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog';
import { DemoService } from '../../core/services/demo.service';
import { apiErrorMessage } from '../../core/services/student.service';
import { PAGE_SIZES, SettingsService } from '../../core/services/settings.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-settings',
  imports: [ConfirmDialogComponent],
  template: `
    <section class="card">
      <div class="card-head"><h2>Preferences</h2></div>
      <div class="field" style="max-width: 280px">
        <label for="page-size">Students per page</label>
        <select id="page-size" (change)="setPageSize($any($event.target).value)">
          @for (n of sizes; track n) {
            <option [value]="n" [selected]="n === settings.pageSize()">{{ n }}</option>
          }
        </select>
        <small class="muted">Saved in this browser and used by the student list.</small>
      </div>
    </section>

    @if (demo.status()?.demoMode) {
      <section class="card">
        <div class="card-head">
          <h2>Demo data</h2>
          <button type="button" class="btn btn-ghost btn-sm" (click)="confirmReset.set(true)">Reset demo data</button>
        </div>
        <p class="muted">
          Restores the original sample students. The data also resets automatically every
          {{ demo.status()?.resetEveryHours }} hours.
        </p>
      </section>
    }

    <section class="card">
      <div class="card-head"><h2>School branding</h2></div>
      <p><span class="muted">School name:</span> <strong>{{ school }}</strong></p>
      <p class="muted">
        To use your own logo, save it as <code>frontend/public/logo.png</code>. To change the name, edit
        <code>schoolName</code> in <code>frontend/src/environments/environment.ts</code>, then reload the page.
      </p>
    </section>

    <section class="card">
      <div class="card-head">
        <h2>API connection</h2>
        <button type="button" class="btn btn-ghost btn-sm" (click)="check()">Test connection</button>
      </div>
      <p><span class="muted">API base URL:</span> <code>{{ apiUrl }}</code></p>
      <p>
        <span class="muted">Status:</span>
        @switch (health()) {
          @case ('checking') { <span class="spinner spinner-sm"></span> Checking... }
          @case ('ok') { <span class="badge badge-active">Connected</span> }
          @case ('down') { <span class="badge badge-inactive">Unreachable</span> }
        }
      </p>
    </section>

    @if (confirmReset()) {
      <app-confirm-dialog
        title="Reset demo data?"
        message="All students will be replaced by the original sample students."
        confirmLabel="Reset"
        busyLabel="Resetting..."
        [busy]="resetting()"
        (confirmed)="reset()"
        (cancelled)="confirmReset.set(false)"
      />
    }
  `,
})
export class SettingsPage implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly toast = inject(ToastService);
  protected readonly settings = inject(SettingsService);
  protected readonly demo = inject(DemoService);
  protected readonly confirmReset = signal(false);
  protected readonly resetting = signal(false);

  protected readonly sizes = PAGE_SIZES;
  protected readonly apiUrl = environment.apiUrl;
  protected readonly school = environment.schoolName;
  protected readonly health = signal<'checking' | 'ok' | 'down'>('checking');

  ngOnInit(): void {
    this.check();
  }

  protected setPageSize(value: string): void {
    this.settings.setPageSize(Number(value));
    this.toast.success('Preference saved');
  }

  protected check(): void {
    this.health.set('checking');
    this.http.get(`${environment.apiUrl}/health`).subscribe({
      next: () => this.health.set('ok'),
      error: () => this.health.set('down'),
    });
  }

  protected reset(): void {
    this.resetting.set(true);
    this.demo.reset().subscribe({
      next: (res) => {
        this.resetting.set(false);
        this.confirmReset.set(false);
        this.toast.success(res.message ?? 'Demo data reset');
      },
      error: (err) => {
        this.resetting.set(false);
        this.confirmReset.set(false);
        this.toast.error(apiErrorMessage(err));
      },
    });
  }
}
