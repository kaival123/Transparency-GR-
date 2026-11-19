import { ChangeDetectionStrategy, Component, computed, inject, linkedSignal, signal } from '@angular/core';
import { APP_SETTINGS } from '../../core/config/app-settings';
import { I18nService } from '../../core/i18n/i18n.service';
import { FilterStateService } from '../../core/services/filter-state.service';
import { TransparencyApiService } from '../../core/services/transparency-api.service';
import { BeneficiaryView, Page } from '../../models/transparency.models';
import { DataTableComponent, PageChange, TableColumn } from '../../shared/components/data-table/data-table.component';
import { ErrorStateComponent } from '../../shared/components/feedback/feedback-states.component';
import { FilterPanelComponent } from '../../shared/components/filter-panel/filter-panel.component';
import { NameSearchComponent } from '../../shared/components/name-search/name-search.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { AsyncState, reactiveLoad } from '../../shared/utils/async-state';

/**
 * Beneficiary list & search (spec §7).
 * - Only approved fields are displayed (see core/disclosure).
 * - Server-side pagination; there is intentionally NO export / bulk download on this page.
 */
@Component({
  selector: 'app-beneficiaries-page',
  imports: [PageHeaderComponent, FilterPanelComponent, DataTableComponent, ErrorStateComponent, NameSearchComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="app-stack">
      <app-page-header [title]="t('nav.beneficiaries')" [subtitle]="t('benef.subtitle')"
                       [breadcrumbs]="[{ label: t('nav.beneficiaries') }]" />
      <app-filter-panel page="beneficiaries" />

      @let s = data.state();
      <div class="app-card">
        @if (s.status === 'error') {
          <app-error-state (retry)="data.reload()" />
        } @else {
          <app-data-table
            tableId="beneficiaries"
            [ariaLabel]="t('benef.aria')"
            [columns]="columns()"
            [rows]="rows()"
            [loading]="s.status === 'loading'"
            [lazy]="true"
            [totalRecords]="total()"
            [first]="first()"
            [pageSize]="pageSize()"
            [globalSearch]="false"
            [emptyTitle]="t('benef.emptyTitle')"
            [emptyMessage]="t('benef.emptyMessage')"
            (pageChange)="onPage($event)">
            <app-name-search tableSearch />
          </app-data-table>
        }
      </div>
    </div>
  `
})
export class BeneficiariesPage {
  private readonly api = inject(TransparencyApiService);
  private readonly filters = inject(FilterStateService).forPage('beneficiaries');
  /** Rows per page (10 / 25 / 50 from the paginator); starts at the configured default. */
  protected readonly pageSize = signal(inject(APP_SETTINGS).beneficiaryPageSize);
  protected readonly t = inject(I18nService).t;

  /** Back to the first page whenever filters change. */
  protected readonly first = linkedSignal({ source: this.filters, computation: () => 0 });

  private readonly query = computed(() => {
    const size = this.pageSize();
    return { filters: this.filters(), page: Math.floor(this.first() / size), size };
  });
  protected readonly data = reactiveLoad(this.query, (q) => this.api.beneficiaries(q.filters, q.page, q.size));

  protected readonly rows = computed(() => {
    const s = this.data.state();
    return s.status === 'success' ? s.data.items : [];
  });
  /** Keeps the previous total while the next page loads, so the paginator doesn't jump. */
  protected readonly total = linkedSignal<AsyncState<Page<BeneficiaryView>>, number>({
    source: this.data.state,
    computation: (s, previous) => (s.status === 'success' ? s.data.total : (previous?.value ?? 0))
  });

  /** Display rules from spec §7. */
  protected readonly columns = computed<TableColumn<BeneficiaryView>[]>(() => [
    { field: 'name', header: this.t('col.name'), hideable: false, maskedFlag: 'nameMasked' },
    { field: 'id', header: this.t('col.id') },
    { field: 'schemeAndYear', header: this.t('col.schemeYear') },
    { field: 'location', header: this.t('col.location') },
    { field: 'benefitAmount', header: this.t('col.benefitAmount'), type: 'currency', emptyText: this.t('benef.notDisclosed') },
    { field: 'benefitPeriod', header: this.t('col.period') }
  ]);

  protected onPage(event: PageChange): void {
    this.pageSize.set(event.rows);
    this.first.set(event.first);
  }
}
