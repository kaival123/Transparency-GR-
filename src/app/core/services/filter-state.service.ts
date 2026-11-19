import { Injectable, Signal, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, ParamMap, Router } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { APP_SETTINGS } from '../config/app-settings';
import {
  DEPENDENT_FILTERS,
  EMPTY_FILTERS,
  FILTER_DEFINITIONS,
  FilterDefinition,
  FilterKey,
  FilterState,
  PageKey
} from '../../models/filter.models';

/**
 * Filter state lives in the URL query string (spec §6: "selected filters will be retained in the page URL
 * so a view can be shared"). The URL is the single source of truth; this service exposes it as signals.
 */
@Injectable({ providedIn: 'root' })
export class FilterStateService {
  private readonly router = inject(Router);
  private readonly settings = inject(APP_SETTINGS);

  readonly state: Signal<FilterState> = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      startWith(null),
      map(() => parseFilters(this.router.parseUrl(this.router.url).queryParamMap))
    ),
    { initialValue: EMPTY_FILTERS }
  );

  /** Filters shown on a page, honouring the optional-filter switches. */
  definitionsFor(page: PageKey): FilterDefinition[] {
    return FILTER_DEFINITIONS.filter(
      (d) =>
        d.appliesTo.includes(page) &&
        !(d.key === 'benefitType' && !this.settings.optionalFilters.benefitType) &&
        !(d.key === 'gender' && !this.settings.optionalFilters.gender)
    );
  }

  /** Only the filters that apply to `page` — other values in the URL are ignored for that page's queries. */
  forPage(page: PageKey): Signal<Partial<FilterState>> {
    const keys = this.definitionsFor(page).map((d) => d.key);
    return computed(
      () => {
        const s = this.state();
        return Object.fromEntries(keys.map((k) => [k, s[k]])) as Partial<FilterState>;
      },
      { equal: (a, b) => JSON.stringify(a) === JSON.stringify(b) }
    );
  }

  activeCount(page: PageKey): Signal<number> {
    const scoped = this.forPage(page);
    return computed(() => Object.values(scoped()).filter((v) => (Array.isArray(v) ? v.length > 0 : !!v)).length);
  }

  /** Updates filters and clears dependent children (District → Taluka → Village, Department → Scheme). */
  update(patch: Partial<FilterState>): void {
    const next: FilterState = { ...this.state(), ...patch };
    for (const key of Object.keys(patch) as FilterKey[]) {
      for (const child of DEPENDENT_FILTERS[key] ?? []) {
        if (!(child in patch)) Object.assign(next, { [child]: EMPTY_FILTERS[child] });
      }
    }
    this.navigate(next);
  }

  reset(): void {
    this.navigate(EMPTY_FILTERS);
  }

  private navigate(state: FilterState): void {
    // merge keeps non-filter params such as ?lang=; empty filters serialise to null and are removed.
    void this.router.navigate([], { queryParams: serializeFilters(state), queryParamsHandling: 'merge', replaceUrl: true });
  }
}

function parseFilters(params: ParamMap): FilterState {
  const state: FilterState = { ...EMPTY_FILTERS };
  for (const def of FILTER_DEFINITIONS) {
    const raw = params.get(def.param);
    if (raw === null || raw === '') continue;
    if (def.type === 'multi') Object.assign(state, { [def.key]: raw.split(',').filter(Boolean) });
    else Object.assign(state, { [def.key]: raw });
  }
  return state;
}

function serializeFilters(state: FilterState): Record<string, string | null> {
  const params: Record<string, string | null> = {};
  for (const def of FILTER_DEFINITIONS) {
    const value = state[def.key];
    params[def.param] = Array.isArray(value) ? (value.length ? value.join(',') : null) : value || null;
  }
  return params;
}
