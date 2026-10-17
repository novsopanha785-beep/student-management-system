import { Component, inject } from '@angular/core';
import { ToastService } from '../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  template: `
    <div class="toast-stack" aria-live="polite">
      @for (t of toasts.toasts(); track t.id) {
        <div class="toast" [class.toast-success]="t.type === 'success'" [class.toast-error]="t.type === 'error'" role="status">
          <span>{{ t.message }}</span>
          <button type="button" aria-label="Dismiss" (click)="toasts.dismiss(t.id)">&times;</button>
        </div>
      }
    </div>
  `,
})
export class ToastContainerComponent {
  protected readonly toasts = inject(ToastService);
}
