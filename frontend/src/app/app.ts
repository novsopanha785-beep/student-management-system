import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DemoService } from './core/services/demo.service';
import { HeaderComponent } from './layout/header';
import { SidebarComponent } from './layout/sidebar';
import { ToastContainerComponent } from './shared/toast-container';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SidebarComponent, HeaderComponent, ToastContainerComponent],
  template: `
    <div class="app-shell">
      <app-sidebar [open]="sidebarOpen()" (navigate)="sidebarOpen.set(false)" />
      @if (sidebarOpen()) {
        <div class="sidebar-backdrop" (click)="sidebarOpen.set(false)"></div>
      }
      <div class="app-main">
        <app-header (menuToggle)="sidebarOpen.set(!sidebarOpen())" />
        @if (demo.status(); as d) {
          @if (d.demoMode) {
            <div class="demo-banner" role="note">
              <strong>Demo site.</strong> Sample data only: up to {{ d.maxStudents }} students, and everyone's changes
              are reset every {{ d.resetEveryHours }} hours. Please don't enter real personal information.
            </div>
          }
        }
        <main class="app-content">
          <router-outlet />
        </main>
      </div>
    </div>
    <app-toast-container />
  `,
})
export class App {
  protected readonly sidebarOpen = signal(false);
  protected readonly demo = inject(DemoService);

  constructor() {
    this.demo.load();
  }
}
