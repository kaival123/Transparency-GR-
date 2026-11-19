import { InjectionToken } from '@angular/core';

export interface AppSettings {
  /** Base URL of the transparency backend. */
  apiBaseUrl: string;
  /**
   * Serve API calls from the in-browser mock backend (core/mock) until the real APIs are available.
   * Set to false once the backend is live; no other code needs to change.
   */
  useMockApi: boolean;
  /** Optional filters from spec §6 (#8, #9) — enable only after disclosure approval. */
  optionalFilters: { benefitType: boolean; gender: boolean };
  beneficiaryPageSize: number;
}

export const DEFAULT_APP_SETTINGS: AppSettings = {
  apiBaseUrl: '/api',
  useMockApi: true,
  optionalFilters: { benefitType: false, gender: false },
  beneficiaryPageSize: 25
};

export const APP_SETTINGS = new InjectionToken<AppSettings>('APP_SETTINGS', {
  providedIn: 'root',
  factory: () => DEFAULT_APP_SETTINGS
});
