import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { I18nService } from '../../core/i18n/i18n.service';
import { TransparencyApiService } from '../../core/services/transparency-api.service';
import { FilterStateService } from '../../core/services/filter-state.service';
import { DashboardSummary } from '../../models/transparency.models';
import { ErrorStateComponent } from '../../shared/components/feedback/feedback-states.component';
import { FilterPanelComponent } from '../../shared/components/filter-panel/filter-panel.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { reactiveLoad } from '../../shared/utils/async-state';
import { BarChartComponent } from './bar-chart.component';

@Component({
  selector: 'app-dashboard-page',
  imports: [PageHeaderComponent, FilterPanelComponent, StatCardComponent, BarChartComponent, ErrorStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="app-stack">
      <app-page-header [title]="t('nav.dashboard')" [subtitle]="t('dashboard.subtitle')" />

      @let s = data.state();
      @let d = summary();
      @if (s.status !== 'error') {
        <div class="app-grid" role="region" [attr.aria-label]="t('dashboard.keyFigures')">
          <app-stat-card [label]="t('kpi.totalBeneficiaries')" icon="pi-users" [loading]="!d" [value]="d ? i18n.number(d.totalBeneficiaries) : ''" />
          <app-stat-card [label]="t('kpi.disbursed')" icon="pi-indian-rupee" [loading]="!d"
                         [value]="d ? i18n.currencyCompact(d.totalAmount) : ''" [hint]="d ? i18n.currency(d.totalAmount) : ''" />
          <app-stat-card [label]="t('kpi.schemes')" icon="pi-briefcase" [loading]="!d" [value]="d ? i18n.number(d.activeSchemes) : ''" />
          <app-stat-card [label]="t('kpi.districts')" icon="pi-map-marker" [loading]="!d" [value]="d ? i18n.number(d.districtsCovered) : ''" />
        </div>
      }

      <app-filter-panel page="dashboard" />

      @if (s.status === 'error') {
        <div class="app-card"><app-error-state (retry)="data.reload()" /></div>
      } @else {
        <div class="widgets">
          <app-bar-chart [title]="t('dashboard.byScheme')" icon="pi-briefcase" [loading]="!d" [rows]="d?.byScheme ?? []" />
          <app-bar-chart [title]="t('dashboard.byDistrict')" icon="pi-map" [loading]="!d" [rows]="d?.byDistrict ?? []" />
        </div>
      }
    </div>
  `,
  styles: `
    .widgets {
      display: grid;
      gap: var(--app-gap);
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 340px), 1fr));
    }
  `
})
export class DashboardPage {
  private readonly api = inject(TransparencyApiService);
  private readonly filters = inject(FilterStateService).forPage('dashboard');
  protected readonly i18n = inject(I18nService);
  protected readonly t = this.i18n.t;

  protected readonly data = reactiveLoad(this.filters, (f) => this.api.dashboard(f));
  protected readonly summary = computed<DashboardSummary | null>(() => {
    const s = this.data.state();
    return s.status === 'success' ? s.data : null;
  });
}
