import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { I18nService } from '../../core/i18n/i18n.service';
import { ExportService } from '../../core/services/export.service';
import { FilterStateService } from '../../core/services/filter-state.service';
import { TransparencyApiService } from '../../core/services/transparency-api.service';
import { SchemeDirectoryRow } from '../../models/transparency.models';
import { DataTableComponent, TableColumn } from '../../shared/components/data-table/data-table.component';
import { ErrorStateComponent } from '../../shared/components/feedback/feedback-states.component';
import { FilterPanelComponent } from '../../shared/components/filter-panel/filter-panel.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { reactiveLoad } from '../../shared/utils/async-state';

@Component({
  selector: 'app-directory-page',
  imports: [PageHeaderComponent, FilterPanelComponent, DataTableComponent, ErrorStateComponent, ButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="app-stack">
      <app-page-header [title]="t('nav.directory')"
                       [breadcrumbs]="[{ label: t('nav.directory') }]" />
      <app-filter-panel page="directory" />

      @let s = data.state();
      <div class="app-card">
        @if (s.status === 'error') {
          <app-error-state (retry)="data.reload()" />
        } @else {
          <app-data-table
            tableId="directory"
            [ariaLabel]="t('nav.directory')"
            [columns]="columns()"
            [rows]="rows()"
            [loading]="s.status === 'loading'"
            [rowActionLabel]="t('directory.rowAction')"
            (rowClick)="openBeneficiaries($event)">
            <div tableActions class="actions">
              <p-button [label]="t('export.excel')" icon="pi pi-file-excel" severity="secondary" [outlined]="true" size="small"
                        [disabled]="!rows().length" (onClick)="exportCsv()" [ariaLabel]="t('export.excelAria')" />
              <p-button [label]="t('export.pdf')" icon="pi pi-file-pdf" severity="secondary" [outlined]="true" size="small"
                        [disabled]="!rows().length" (onClick)="exportPdf()" [ariaLabel]="t('export.pdfAria')" />
            </div>
          </app-data-table>
        }
      </div>
    </div>
  `,
  styles: `.actions { display: flex; gap: 0.5rem; }`
})
export class DirectoryPage {
  private readonly api = inject(TransparencyApiService);
  private readonly exporter = inject(ExportService);
  private readonly messages = inject(MessageService);
  private readonly router = inject(Router);
  private readonly filters = inject(FilterStateService).forPage('directory');
  protected readonly i18n = inject(I18nService);
  protected readonly t = this.i18n.t;

  protected readonly data = reactiveLoad(this.filters, (f) => this.api.directory(f));
  protected readonly rows = computed(() => {
    const s = this.data.state();
    return s.status === 'success' ? s.data : [];
  });

  protected readonly columns = computed<TableColumn<SchemeDirectoryRow>[]>(() => [
    { field: 'scheme', header: this.t('col.scheme'), hideable: false },
    { field: 'department', header: this.t('col.department') },
    { field: 'benefitType', header: this.t('col.benefitType') },
    { field: 'beneficiaries', header: this.t('col.beneficiaries'), type: 'number' },
    { field: 'amount', header: this.t('col.amount'), type: 'currency' },
    { field: 'status', header: this.t('col.status'), type: 'status' }
  ]);

  /** Context-aware action: jump to the beneficiary list scoped to the scheme, keeping other filters. */
  protected openBeneficiaries(row: SchemeDirectoryRow): void {
    void this.router.navigate(['/beneficiaries'], { queryParams: { scheme: row.id }, queryParamsHandling: 'merge' });
  }

  /** Export in the current language: translated headers, status labels and localised numbers. */
  private exportRows() {
    return this.rows().map((r) => ({
      ...r,
      beneficiaries: this.i18n.number(r.beneficiaries),
      amount: this.i18n.currency(r.amount),
      status: this.t(`status.${r.status}`)
    }));
  }

  private exportColumns() {
    return this.columns().map((c) => ({ field: c.field, header: c.header }));
  }

  protected exportCsv(): void {
    this.exporter.toCsv(this.exportRows(), this.exportColumns(), 'scheme-directory');
    this.messages.add({ key: 'global', severity: 'success', summary: this.t('export.ready'), detail: this.t('export.downloaded', { file: 'scheme-directory.csv' }) });
  }

  protected exportPdf(): void {
    if (!this.exporter.toPrint(this.exportRows(), this.exportColumns(), this.t('nav.directory'), this.i18n.lang())) {
      this.messages.add({ key: 'global', severity: 'warn', summary: this.t('export.popupBlocked'), detail: this.t('export.allowPopups') });
    }
  }
}
