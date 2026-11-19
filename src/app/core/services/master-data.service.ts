import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of, shareReplay } from 'rxjs';
import { APP_SETTINGS } from '../config/app-settings';
import { I18nService } from '../i18n/i18n.service';
import { MasterOption, SchemeOption } from '../../models/master-data.models';

/** Filter values come from the master data APIs (spec §6). Static lists are cached for the session. */
@Injectable({ providedIn: 'root' })
export class MasterDataService {
  private readonly http = inject(HttpClient);
  private readonly base = `${inject(APP_SETTINGS).apiBaseUrl}/master`;
  private readonly i18n = inject(I18nService);
  /** Keyed by language + path: labels are localised by the API (Accept-Language). */
  private readonly cache = new Map<string, Observable<MasterOption[]>>();

  financialYears(): Observable<MasterOption[]> {
    return this.cached('financial-years');
  }

  departments(): Observable<MasterOption[]> {
    return this.cached('departments');
  }

  districts(): Observable<MasterOption[]> {
    return this.cached('districts');
  }

  benefitTypes(): Observable<MasterOption[]> {
    return this.cached('benefit-types');
  }

  genders(): Observable<MasterOption[]> {
    return this.cached('genders');
  }

  /** Scheme list is dependent on the selected departments; all schemes when none selected. */
  schemes(departmentIds: readonly string[]): Observable<SchemeOption[]> {
    const params = departmentIds.length ? new HttpParams().set('departmentIds', departmentIds.join(',')) : undefined;
    return this.http.get<SchemeOption[]>(`${this.base}/schemes`, { params });
  }

  talukas(districtId: string | null): Observable<MasterOption[]> {
    return districtId ? this.cached(`talukas?districtId=${encodeURIComponent(districtId)}`) : of([]);
  }

  villages(talukaId: string | null): Observable<MasterOption[]> {
    return talukaId ? this.cached(`villages?talukaId=${encodeURIComponent(talukaId)}`) : of([]);
  }

  private cached(path: string): Observable<MasterOption[]> {
    const key = `${this.i18n.lang()}|${path}`;
    let request = this.cache.get(key);
    if (!request) {
      request = this.http.get<MasterOption[]>(`${this.base}/${path}`).pipe(shareReplay({ bufferSize: 1, refCount: false }));
      this.cache.set(key, request);
    }
    return request;
  }
}
