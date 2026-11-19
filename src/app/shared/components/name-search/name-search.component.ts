import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { debounceTime, distinctUntilChanged, map } from 'rxjs';
import { I18nService } from '../../../core/i18n/i18n.service';
import { FilterStateService } from '../../../core/services/filter-state.service';
import { FILTER_DEFINITIONS } from '../../../models/filter.models';

const NAME_MIN = FILTER_DEFINITIONS.find((d) => d.key === 'name')?.minLength ?? 3;

/**
 * Beneficiary name search (spec §6): text search, minimum 3 characters, debounced.
 * Writes the shared `name` filter, so it stays in the URL and is cleared by the Filters panel's Reset.
 */
@Component({
  selector: 'app-name-search',
  imports: [FormsModule, IconFieldModule, InputIconModule, InputTextModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Visually hidden: the placeholder says what to type; screen readers still get a proper label. -->
    <label for="name-search" class="sr-only">{{ t('filter.name') }}</label>
    <p-iconfield>
      <p-inputicon class="pi pi-search" />
      <input pInputText type="search" id="name-search"
             [ngModel]="draft()" (ngModelChange)="draft.set($event)"
             [placeholder]="t('filters.searchName')" autocomplete="off"
             [attr.aria-invalid]="tooShort()" aria-describedby="name-search-hint"
             [class.ng-invalid]="tooShort()" [class.ng-dirty]="tooShort()" />
    </p-iconfield>
    <small id="name-search-hint" [class.error]="tooShort()" aria-live="polite">
      {{ tooShort() ? t('filters.enterMinChars', { n: min }) : t('filters.minChars', { n: min }) }}
    </small>
  `,
  styles: `
    :host { display: flex; flex-direction: column; gap: 0.375rem; width: min(100%, 18rem); }
    p-iconfield, input { width: 100%; }
    small { font-size: 0.75rem; color: var(--app-muted); }
    small.error { color: var(--p-red-500); }
    @media (max-width: 640px) { :host { width: 100%; } }
  `
})
export class NameSearchComponent {
  private readonly filters = inject(FilterStateService);
  protected readonly t = inject(I18nService).t;
  protected readonly min = NAME_MIN;

  protected readonly draft = signal('');
  protected readonly tooShort = computed(() => {
    const len = this.draft().trim().length;
    return len > 0 && len < NAME_MIN;
  });

  constructor() {
    // Follow the URL (back/forward, Reset, shared links).
    effect(() => this.draft.set(this.filters.state().name));
    toObservable(this.draft)
      .pipe(
        map((v) => v.trim()),
        debounceTime(400),
        distinctUntilChanged(),
        takeUntilDestroyed()
      )
      .subscribe((name) => {
        if ((name.length === 0 || name.length >= NAME_MIN) && name !== this.filters.state().name) this.filters.update({ name });
      });
  }
}
