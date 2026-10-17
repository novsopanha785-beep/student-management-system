import { Injectable, signal } from '@angular/core';

const KEY = 'sms.pageSize';
export const PAGE_SIZES = [5, 10, 20, 50];

@Injectable({ providedIn: 'root' })
export class SettingsService {
  readonly pageSize = signal<number>(this.load());

  setPageSize(size: number): void {
    if (!PAGE_SIZES.includes(size)) return;
    this.pageSize.set(size);
    try {
      localStorage.setItem(KEY, String(size));
    } catch {
      /* storage unavailable - keep the value in memory only */
    }
  }

  private load(): number {
    try {
      const n = Number(localStorage.getItem(KEY));
      return PAGE_SIZES.includes(n) ? n : 10;
    } catch {
      return 10;
    }
  }
}
