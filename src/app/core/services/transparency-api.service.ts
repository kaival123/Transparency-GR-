import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { APP_SETTINGS } from '../config/app-settings';
import { toBeneficiaryView } from '../disclosure/beneficiary-disclosure';
import { I18nService } from '../i18n/i18n.service';
import { FilterState } from '../../models/filter.models';
import {
  BeneficiaryApiRecord,
  BeneficiaryView,
  DashboardSummary,
  Page,
  SchemeDirectoryRow
} from '../../models/transparency.models';

/** Serialises a (page-scoped) filter state into query params, skipping empty values. */
export function filtersToParams(filters: Partial<FilterState>): HttpParams {
  let params = new HttpParams();
  for (const [key, value] of Object.entries(filters)) {
    if (Array.isArray(value)) {
      if (value.length) params = params.set(key, value.join(','));
    } else if (value !== null && value !== undefined && value !== '') {
      params = params.set(key, value);
    }
  }
  return params;
}

@Injectable({ providedIn: 'root' })
export class TransparencyApiService {
  private readonly http = inject(HttpClient);
  private readonly base = inject(APP_SETTINGS).apiBaseUrl;
  private readonly i18n = inject(I18nService);

  dashboard(filters: Partial<FilterState>): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>(`${this.base}/dashboard/summary`, { params: filtersToParams(filters) });
  }

  directory(filters: Partial<FilterState>): Observable<SchemeDirectoryRow[]> {
    return this.http.get<SchemeDirectoryRow[]>(`${this.base}/schemes/directory`, { params: filtersToParams(filters) });
  }

  /** Always paginated — bulk download of beneficiary-level data is not offered (spec §7). */
  beneficiaries(filters: Partial<FilterState>, page: number, size: number): Observable<Page<BeneficiaryView>> {
    const params = filtersToParams(filters).set('page', page).set('size', size);
    const locale = this.i18n.locale();
    return this.http
      .get<Page<BeneficiaryApiRecord>>(`${this.base}/beneficiaries`, { params })
      .pipe(map((res) => ({ total: res.total, items: res.items.map((r) => toBeneficiaryView(r, locale)) })));
  }
}
