import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  template: `
    <div class="modal-backdrop" (click)="cancelled.emit()">
      <div class="modal" role="alertdialog" aria-modal="true" [attr.aria-label]="title()" (click)="$event.stopPropagation()">
        <h2>{{ title() }}</h2>
        <p>{{ message() }}</p>
        <div class="modal-actions">
          <button type="button" class="btn btn-ghost" [disabled]="busy()" (click)="cancelled.emit()">Cancel</button>
          <button type="button" class="btn btn-danger" [disabled]="busy()" (click)="confirmed.emit()">
            {{ busy() ? busyLabel() : confirmLabel() }}
          </button>
        </div>
      </div>
    </div>
  `,
})
export class ConfirmDialogComponent {
  readonly title = input('Are you sure?');
  readonly message = input('');
  readonly confirmLabel = input('Delete');
  readonly busy = input(false);
  readonly busyLabel = input('Deleting...');
  readonly confirmed = output<void>();
  readonly cancelled = output<void>();
}
