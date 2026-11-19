import { ChangeDetectionStrategy, Component, OnInit, computed, inject, input, linkedSignal, output, signal } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { map } from 'rxjs';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SkeletonModule } from 'primeng/skeleton';
import { TableFilterEvent, TableModule, TablePageEvent } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { I18nService } from '../../../core/i18n/i18n.service';
import { PreferencesService } from '../../../core/services/preferences.service';
import { EmptyStateComponent } from '../feedback/feedback-states.component';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';

/** Tables scroll internally once a page shows more rows than this. */
const MAX_ROWS_BEFORE_SCROLL = 10;
/** Roughly 10 rows tall; the header stays pinned while the body scrolls. */
const SCROLL_HEIGHT = '36rem';

export type ColumnType ='text' | 'number' | 'currency' | 'status';

export interface TableColumn<T> {
  field: keyof T & string;
  header: string;
  type?: ColumnType;
  sortable?: boolean;
  /** Users may hide this column via the column picker. Defaults to true. */
  hideable?: boolean;
  /** Shown when the value is null/empty (e.g. "Not disclosed"). */
  emptyText?: string;
  /** Boolean field on the row; when true a lock icon explains the value is masked. */
  maskedFlag?: keyof T & string;
}

export interface PageChange {
  first: number;
  rows: number;
}

@Component({
  selector: 'app-data-table',
  imports: [
    FormsModule, TableModule, MultiSelectModule, InputTextModule, IconFieldModule, InputIconModule,
    SkeletonModule, TooltipModule, EmptyStateComponent, StatusBadgeComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.css'
})
export class DataTableComponent<T extends object> implements OnInit {
  private readonly prefs = inject(PreferencesService);
  protected readonly i18n = inject(I18nService);
  protected readonly t = this.i18n.t;

  /** Phones: rows become stacked cards and the paginator is simplified. */
  protected readonly compact = toSignal(
    inject(BreakpointObserver).observe('(max-width: 640px)').pipe(map((r) => r.matches)),
    { initialValue: false }
  );

  readonly columns = input.required<TableColumn<T>[]>();
  readonly rows = input<T[]>([]);
  readonly loading = input(false);
  /** Key for persisting the user's visible columns. */
  readonly tableId = input<string>();
  readonly dataKey = input<string>('id');
  readonly heading = input<string>();
  readonly ariaLabel = input<string>();
  readonly pageSize = input(10);
  readonly globalSearch = input(true);
  readonly columnPicker = input(true);
  /** Server-side pagination. */
  readonly lazy = input(false);
  readonly totalRecords = input(0);
  readonly first = input(0);
  readonly rowActionLabel = input<string>();
  /** Defaults to the translated "No records found" / hint. */
  readonly emptyTitle = input<string>();
  readonly emptyMessage = input<string>();

  readonly rowClick = output<T>();
  readonly pageChange = output<PageChange>();

  protected readonly visibleFields = signal<string[]>([]);
  protected readonly hideableColumns = computed(() => this.columns().filter((c) => c.hideable !== false));
  protected readonly visibleColumns = computed(() => {
    const visible = new Set(this.visibleFields());
    return this.columns().filter((c) => c.hideable === false || visible.has(c.field));
  });
  protected readonly globalFields = computed(() => this.columns().map((c) => c.field));
  /** "Columns (5)" with the count in the current language's digits. */
  protected readonly columnsLabel = computed(() => this.t('table.columnsCount').replace('{0}', this.i18n.number(this.visibleFields().length)));

  // Paging state is tracked here so the "1–10 of 165" report uses localised digits (PrimeNG would print ASCII).
  private readonly clientFirst = linkedSignal({ source: this.rows, computation: () => 0 });
  private readonly pageRows = linkedSignal(() => this.pageSize());
  private readonly filteredCount = linkedSignal<T[], number | null>({ source: this.rows, computation: () => null });
  protected readonly pageReport = computed(() => {
    const total = this.lazy() ? this.totalRecords() : (this.filteredCount() ?? this.rows().length);
    if (!total) return '';
    const first = this.lazy() ? this.first() : this.clientFirst();
    return this.t('table.pageReport', { first: first + 1, last: Math.min(first + this.pageRows(), total), totalRecords: total });
  });

  /** Rows actually on screen for the current page. */
  private readonly visibleRowCount = computed(() => {
    if (this.lazy()) return this.loading() ? this.pageRows() : this.rows().length;
    const total = this.filteredCount() ?? this.rows().length;
    return Math.max(0, Math.min(this.pageRows(), total - this.clientFirst()));
  });
  /** More than 10 rows on screen → the body scrolls inside a ~10-row box with a sticky header (not on phones). */
  protected readonly scrollBody = computed(() => !this.compact() && this.visibleRowCount() > MAX_ROWS_BEFORE_SCROLL);
  protected readonly scrollHeight = SCROLL_HEIGHT;

  protected readonly skeletonRows = computed(() => Array.from({ length: Math.min(this.pageSize(), 8) }, (_, i) => ({ __skeleton: i })));

  ngOnInit(): void {
    const all: string[] = this.hideableColumns().map((c) => c.field);
    const saved = this.tableId() ? this.prefs.get<string[]>(`columns.${this.tableId()}`, all) : all;
    this.visibleFields.set(saved.filter((f) => all.includes(f)));
  }

  protected onColumnsChange(fields: string[]): void {
    this.visibleFields.set(fields);
    if (this.tableId()) this.prefs.set(`columns.${this.tableId()}`, fields);
  }

  protected onPage(event: TablePageEvent): void {
    this.clientFirst.set(event.first);
    this.pageRows.set(event.rows);
    this.pageChange.emit({ first: event.first, rows: event.rows });
  }

  protected clientFirstReset(): void {
    this.clientFirst.set(0);
  }

  protected onFilter(event: TableFilterEvent): void {
    this.filteredCount.set(event.filteredValue?.length ?? null);
    this.clientFirst.set(0);
  }

  protected value(row: T, col: TableColumn<T>): unknown {
    return row[col.field];
  }

  protected display(row: T, col: TableColumn<T>): string {
    const v = row[col.field];
    if (v === null || v === undefined || v === '') return col.emptyText ?? '—';
    if (col.type === 'currency' && typeof v === 'number') return this.i18n.currency(v);
    if (col.type === 'number' && typeof v === 'number') return this.i18n.number(v);
    if (col.type === 'status') return String(v);
    return String(v);
  }

  protected isMasked(row: T, col: TableColumn<T>): boolean {
    return !!col.maskedFlag && !!row[col.maskedFlag];
  }

  protected isEmpty(row: T, col: TableColumn<T>): boolean {
    const v = row[col.field];
    return v === null || v === undefined || v === '';
  }
}
