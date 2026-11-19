import { ChangeDetectionStrategy, Component, DOCUMENT, Signal, computed, inject, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { Observable, catchError, combineLatest, distinctUntilChanged, of, switchMap } from 'rxjs';
import { TranslationKey } from '../../../core/i18n/en';
import { I18nService } from '../../../core/i18n/i18n.service';
import { MasterDataService } from '../../../core/services/master-data.service';
import { FilterStateService } from '../../../core/services/filter-state.service';
import { FilterDefinition, FilterKey, PageKey } from '../../../models/filter.models';
import { MasterOption } from '../../../models/master-data.models';

@Component({
  selector: 'app-filter-panel',
  imports: [FormsModule, SelectModule, MultiSelectModule, ButtonModule, BadgeModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './filter-panel.component.html',
  styleUrl: './filter-panel.component.css'
})
export class FilterPanelComponent {
  private readonly filters = inject(FilterStateService);
  private readonly master = inject(MasterDataService);
  private readonly confirm = inject(ConfirmationService);
  private readonly messages = inject(MessageService);
  private readonly document = inject(DOCUMENT);
  protected readonly i18n = inject(I18nService);
  protected readonly t = this.i18n.t;

  readonly page = input.required<PageKey>();

  protected readonly state = this.filters.state;
  /** Collapsed by default on phones so results stay visible; the badge still shows active filters. */
  protected readonly expanded = signal(this.document.defaultView?.matchMedia?.('(min-width: 768px)').matches ?? true);
  protected readonly definitions = computed(() => this.filters.definitionsFor(this.page()));
  /** Filters drawn in this panel; table-placed ones (e.g. name search) live in the results toolbar but still count as active. */
  protected readonly panelDefinitions = computed(() => this.definitions().filter((d) => d.placement !== 'table'));
  protected readonly activeCount = computed(() =>
    this.definitions().filter((d) => {
      const v = this.state()[d.key];
      return Array.isArray(v) ? v.length > 0 : !!v;
    }).length
  );

  // ----- Master data (spec §6: values come from master data APIs) -----
  private readonly appliesDept = computed(() => this.definitions().some((d) => d.key === 'dept'));
  private readonly deptForSchemes = computed(() => (this.appliesDept() ? this.state().dept.join(',') : ''));

  protected readonly options: Record<FilterKey, Signal<MasterOption[] | undefined>> = {
    fy: this.load(() => this.master.financialYears()),
    dept: this.load(() => this.master.departments()),
    scheme: this.loadDependent(this.deptForSchemes, (ids) => this.master.schemes(ids ? ids.split(',') : [])),
    district: this.load(() => this.master.districts()),
    taluka: this.loadDependent(computed(() => this.state().district), (id) => this.master.talukas(id)),
    village: this.loadDependent(computed(() => this.state().taluka), (id) => this.master.villages(id)),
    name: signal([]),
    benefitType: this.load(() => this.master.benefitTypes()),
    gender: this.load(() => this.master.genders())
  };

  /** Optional filters (#8, #9) are hidden when no master data is available. */
  protected isVisible(def: FilterDefinition): boolean {
    if (!def.optional) return true;
    const opts = this.options[def.key]();
    return opts === undefined || opts.length > 0;
  }

  protected isDisabled(def: FilterDefinition): boolean {
    if (def.key === 'taluka') return !this.state().district;
    if (def.key === 'village') return !this.state().taluka;
    return false;
  }

  protected label(def: FilterDefinition): string {
    return this.t(`filter.${def.key}` as TranslationKey);
  }

  protected placeholder(def: FilterDefinition): string {
    if (def.key === 'taluka' && !this.state().district) return this.t('filters.selectDistrictFirst');
    if (def.key === 'village' && !this.state().taluka) return this.t('filters.selectTalukaFirst');
    return def.type === 'multi' ? this.t(`filters.all.${def.key}` as TranslationKey) : this.t('filters.all');
  }

  /** "3 selected" with the count in the current language's digits. */
  protected selectedLabel(def: FilterDefinition): string {
    const value = this.state()[def.key];
    return this.t('filters.selectedCount').replace('{0}', this.i18n.number(Array.isArray(value) ? value.length : 0));
  }

  protected setValue(key: FilterKey, value: string | string[] | null): void {
    this.filters.update({ [key]: value ?? (Array.isArray(this.state()[key]) ? [] : null) });
  }

  protected reset(): void {
    this.confirm.confirm({
      header: this.t('filters.confirmHeader'),
      message: this.t('filters.confirmMessage'),
      icon: 'pi pi-filter-slash',
      acceptLabel: this.t('filters.confirmAccept'),
      rejectLabel: this.t('common.cancel'),
      rejectButtonProps: { severity: 'secondary', outlined: true },
      accept: () => {
        this.filters.reset();
        this.messages.add({ key: 'global', severity: 'info', summary: this.t('filters.cleared') });
      }
    });
  }

  protected async share(): Promise<void> {
    // Include the language so the recipient sees the same view in the same language.
    const link = new URL(this.document.location.href);
    link.searchParams.set('lang', this.i18n.lang());
    const url = link.toString();
    try {
      await navigator.clipboard.writeText(url);
      this.messages.add({ key: 'global', severity: 'success', summary: this.t('filters.linkCopied'), detail: this.t('filters.linkCopiedDetail') });
    } catch {
      this.messages.add({ key: 'global', severity: 'warn', summary: this.t('filters.copyFailed'), detail: url });
    }
  }

  /** Master data reloads in the new language whenever the UI language changes. */
  private load(fetch: () => Observable<MasterOption[]>): Signal<MasterOption[] | undefined> {
    return toSignal(toObservable(this.i18n.lang).pipe(switchMap(() => fetch().pipe(catchError(() => of([]))))));
  }

  private loadDependent<P>(param: Signal<P>, fetch: (p: P) => Observable<MasterOption[]>): Signal<MasterOption[] | undefined> {
    return toSignal(
      combineLatest([toObservable(param).pipe(distinctUntilChanged()), toObservable(this.i18n.lang)]).pipe(
        switchMap(([p]) => fetch(p).pipe(catchError(() => of([]))))
      )
    );
  }
}
