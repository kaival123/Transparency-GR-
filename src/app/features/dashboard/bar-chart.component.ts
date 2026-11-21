import {
  ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, computed, effect, inject, input, signal, viewChild
} from '@angular/core';
import { BarChart } from 'echarts/charts';
import { GridComponent, TooltipComponent } from 'echarts/components';
import * as echarts from 'echarts/core';
import { SVGRenderer } from 'echarts/renderers';
import { SkeletonModule } from 'primeng/skeleton';
import { I18nService } from '../../core/i18n/i18n.service';
import { ThemeService, themePalette } from '../../core/services/theme.service';
import { LabelledMetric } from '../../models/transparency.models';
import { EmptyStateComponent } from '../../shared/components/feedback/feedback-states.component';

echarts.use([BarChart, GridComponent, TooltipComponent, SVGRenderer]);

/** Plot height (px); names below the columns get their own space. */
const CHART_HEIGHT = 300;

/** Dashboard widget: ranked vertical bar (column) chart (ECharts) — one series, so one colour and no legend. */
@Component({
  selector: 'app-bar-chart',
  imports: [SkeletonModule, EmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="app-card" [attr.aria-busy]="loading()">
      <h2 class="app-card-title"><i [class]="'pi ' + icon()" aria-hidden="true"></i>{{ title() }}</h2>

      @if (loading()) {
        <div class="skel">
          @for (h of [90, 75, 70, 60, 55]; track $index) { <p-skeleton width="12%" [height]="h + '%'" /> }
        </div>
      } @else if (!sorted().length) {
        <app-empty-state [title]="t('state.noDataForFilters')" />
      }

      <!-- Kept in the DOM so ECharts keeps its instance across reloads; screen readers use the list below. -->
      <div #chart class="chart" aria-hidden="true" [hidden]="loading() || !sorted().length"></div>

      <ul class="sr-only" [attr.aria-label]="title()">
        @for (r of sorted(); track r.label) {
          <li>{{ r.label }}: {{ i18n.number(r.beneficiaries) }} {{ t('chart.total') }}, {{ i18n.currency(r.amount) }}</li>
        }
      </ul>
    </section>
  `,
  styles: `
    :host { display: block; height: 100%; }
    /* Card stretches to match its neighbour (e.g. the map); the chart takes all the height left under the title. */
    section { height: 100%; display: flex; flex-direction: column; }
    .chart { width: 100%; flex: 1 1 auto; min-height: ${CHART_HEIGHT}px; }
    .chart[hidden] { display: none; }
    .skel { height: ${CHART_HEIGHT}px; display: flex; align-items: flex-end; justify-content: space-around; padding-bottom: 3rem; }
  `
})
export class BarChartComponent {
  readonly title = input.required<string>();
  readonly icon = input('pi-chart-bar');
  readonly rows = input<LabelledMetric[]>([]);
  readonly loading = input(false);

  protected readonly i18n = inject(I18nService);
  protected readonly t = this.i18n.t;
  private readonly theme = inject(ThemeService);
  private readonly chartEl = viewChild.required<ElementRef<HTMLDivElement>>('chart');
  private readonly chart = signal<echarts.ECharts | null>(null);
  /** Chart width in px (tracked so name wrapping follows resizes). */
  private readonly width = signal(0);
  /** Data last drawn — bars/areas only animate in when the data changes, not on a theme switch or resize. */
  private drawn: unknown = null;

  /** Largest first, left to right. */
  protected readonly sorted = computed(() => [...this.rows()].sort((a, b) => b.beneficiaries - a.beneficiaries));

  constructor() {
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      const el = this.chartEl().nativeElement;
      const instance = echarts.init(el, null, { renderer: 'svg' });
      const resize = new ResizeObserver(() => {
        instance.resize();
        this.width.set(el.clientWidth);
      });
      resize.observe(el);
      // Names under the bars are cut with "…"; hovering one opens that bar's tooltip, which has the full name.
      instance.on('mouseover', { componentType: 'xAxis' }, (e) => {
        const dataIndex = this.sorted().findIndex((r) => r.label === (e as { value?: string }).value);
        if (dataIndex >= 0) instance.dispatchAction({ type: 'showTip', seriesIndex: 0, dataIndex });
      });
      instance.on('mouseout', { componentType: 'xAxis' }, () => instance.dispatchAction({ type: 'hideTip' }));
      this.chart.set(instance);
      destroyRef.onDestroy(() => {
        resize.disconnect();
        instance.dispose();
      });
    });

    effect(() => {
      const instance = this.chart();
      const data = this.sorted();
      const width = this.width();
      if (!instance || !width || !data.length) return;
      const dark = this.theme.dark();
      const shades = themePalette(this.theme.colour()) as unknown as Record<number, string>;
      const bar = dark ? shades[400] : shades[500];
      const ink = dark ? '#f4f4f5' : '#0f172a';
      const muted = dark ? '#a1a1aa' : '#64748b';
      const grid = dark ? '#3f3f46' : '#e2e8f0';
      const surface = dark ? '#18181b' : '#ffffff';
      const animate = data !== this.drawn;
      this.drawn = data;

      // Each column's slot width — names stay on one line and end in "…" when longer; the tooltip has the full name.
      // Leaves a clear gap (≥16px) between neighbouring names.
      const band = Math.max(40, (width - 48) / data.length - 20);
      // Too narrow to wrap cleanly (phones): tilt names and truncate them; the tooltip has the full name.
      const slot = (width - 48) / data.length;
      const tilt = slot < 72 && data.some((r) => r.label.length * 6.5 > slot - 4);

      instance.setOption(
        {
          animation: animate,
          animationDuration: 400,
          grid: { left: 40, right: 8, top: 24, bottom: tilt ? 76 : 32, containLabel: false },
          tooltip: {
            trigger: 'item',
            confine: true,
            backgroundColor: surface,
            borderColor: grid,
            textStyle: { color: ink, fontFamily: 'inherit', fontSize: 12 },
            formatter: (p: { dataIndex: number }) => this.tooltip(data[p.dataIndex], bar)
          },
          xAxis: {
            type: 'category',
            data: data.map((r) => r.label),
            triggerEvent: true,
            axisTick: { show: false },
            axisLine: { lineStyle: { color: grid } },
            axisLabel: tilt
              ? { interval: 0, rotate: 40, color: ink, fontFamily: 'inherit', fontSize: 11, width: 84, overflow: 'truncate' }
              : { interval: 0, color: ink, fontFamily: 'inherit', fontSize: 11, width: band, overflow: 'truncate' }
          },
          yAxis: {
            type: 'value',
            splitNumber: 4,
            axisLabel: { color: muted, fontFamily: 'inherit', fontSize: 11, formatter: (v: number) => this.i18n.number(v) },
            splitLine: { lineStyle: { color: grid, type: 'dashed' } }
          },
          series: [
            {
              type: 'bar',
              barMaxWidth: 40,
              // Rounded data end only; flat on the baseline.
              itemStyle: { color: bar, borderRadius: [4, 4, 0, 0] },
              emphasis: { itemStyle: { color: dark ? shades[300] : shades[600] } },
              label: {
                show: true,
                position: 'top',
                fontFamily: 'inherit',
                fontSize: 12,
                fontWeight: 700,
                color: ink,
                formatter: (p: { dataIndex: number }) => this.i18n.number(data[p.dataIndex].beneficiaries)
              },
              data: data.map((r) => r.beneficiaries)
            }
          ]
        },
        { notMerge: true }
      );
    });
  }

  private tooltip(r: LabelledMetric | undefined, colour: string): string {
    if (!r) return '';
    const esc = (v: string) => v.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
    return (
      `<div style="display:flex;align-items:center;gap:6px;font-weight:600;margin-bottom:2px">` +
      `<span style="width:10px;height:10px;border-radius:3px;background:${colour}"></span>${esc(r.label)}</div>` +
      `<div>${esc(this.t('kpi.beneficiaries'))}: <b>${esc(this.i18n.number(r.beneficiaries))}</b></div>` +
      `<div>${esc(this.t('kpi.disbursed'))}: <b>${esc(this.i18n.currency(r.amount))}</b></div>`
    );
  }
}
