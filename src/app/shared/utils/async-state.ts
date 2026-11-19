import { Signal, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Observable, catchError, combineLatest, map, of, startWith, switchMap } from 'rxjs';
import { I18nService } from '../../core/i18n/i18n.service';

export type AsyncState<T> =
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error' };

export const LOADING: AsyncState<never> = { status: 'loading' };

/** Wraps a request so templates can render loading / success / error without manual subscriptions. */
export function toAsyncState<T>(source: Observable<T>): Observable<AsyncState<T>> {
  return source.pipe(
    map((data): AsyncState<T> => ({ status: 'success', data })),
    startWith(LOADING as AsyncState<T>),
    // The UI shows a translated error state; details are reported by the error interceptor.
    catchError(() => of<AsyncState<T>>({ status: 'error' }))
  );
}

/**
 * Re-runs `load` whenever `params` or the UI language changes (or `reload()` is called), cancelling stale requests.
 * Must be called in an injection context (e.g. a component field initialiser).
 */
export function reactiveLoad<P, T>(
  params: Signal<P>,
  load: (p: P) => Observable<T>
): { state: Signal<AsyncState<T>>; reload: () => void } {
  const trigger = signal(0);
  const lang = inject(I18nService).lang;
  const state = toSignal(
    combineLatest([toObservable(params), toObservable(trigger), toObservable(lang)]).pipe(switchMap(([p]) => toAsyncState(load(p)))),
    { initialValue: LOADING as AsyncState<T> }
  );
  return { state, reload: () => trigger.update((n) => n + 1) };
}
