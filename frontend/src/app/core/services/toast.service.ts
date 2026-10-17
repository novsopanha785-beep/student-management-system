import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  type: 'success' | 'error';
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<Toast[]>([]);
  private nextId = 1;

  success(message: string): void {
    this.push('success', message, 4000);
  }

  error(message: string): void {
    this.push('error', message, 6000);
  }

  dismiss(id: number): void {
    this.toasts.update((list) => list.filter((t) => t.id !== id));
  }

  private push(type: Toast['type'], message: string, ms: number): void {
    const id = this.nextId++;
    this.toasts.update((list) => [...list, { id, type, message }]);
    setTimeout(() => this.dismiss(id), ms);
  }
}
