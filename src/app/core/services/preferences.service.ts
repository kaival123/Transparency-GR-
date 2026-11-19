import { Injectable } from '@angular/core';

/** Per-browser UI preferences (theme, visible table columns). Storage may be unavailable; never throws. */
@Injectable({ providedIn: 'root' })
export class PreferencesService {
  private readonly prefix = 'tp.pref.';

  get<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(this.prefix + key);
      return raw === null ? fallback : (JSON.parse(raw) as T);
    } catch {
      return fallback;
    }
  }

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(value));
    } catch {
      /* storage blocked — preference simply isn't persisted */
    }
  }
}
