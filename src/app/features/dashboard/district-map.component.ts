import {
  ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, computed, effect, inject, input, signal, viewChild
} from '@angular/core';
import { MapChart } from 'echarts/charts';
import { TooltipComponent, VisualMapComponent } from 'echarts/components';
import * as echarts from 'echarts/core';
import { SVGRenderer } from 'echarts/renderers';
import { SkeletonModule } from 'primeng/skeleton';
import { I18nService } from '../../core/i18n/i18n.service';
import { ThemeService, themePalette } from '../../core/services/theme.service';
import { LabelledMetric } from '../../models/transparency.models';
import { EmptyStateComponent } from '../../shared/components/feedback/feedback-states.component';

echarts.use([MapChart, TooltipComponent, VisualMapComponent, SVGRenderer]);

const MAP_NAME = 'maharashtra';
const MAP_URL = 'maps/maharashtra-districts.json';
const CHART_HEIGHT = 560;
const NARROW = 380;

/** Lower-case letters only, so "Mumbai Suburban" / "mumbai-suburban" compare equal. */
const norm = (s: string) => s.toLowerCase().replace(/[^a-z]/g, '');

/** New official names → the (2011 census) names used by the boundary file. */
const ALIASES: Record<string, string> = {
  chhatrapatisambhajinagar: 'aurangabad',
  dharashiv: 'osmanabad',
  ahilyanagar: 'ahmednagar',
  mumbaicity: 'mumbai',
  mumbaisuburban: 'mumbai'
};
const featureKey = (s: string) => ALIASES[norm(s)] ?? norm(s);

/** Boundary file is fetched once per app session and shared by every map instance. */
let geoLoad: Promise<string[]> | null = null;
function loadGeo(): Promise<string[]> {
  geoLoad ??= fetch(MAP_URL)
    .then((r) => {
      if (!r.ok) throw new Error(`Map ${r.status}`);
      return r.json();
    })
    .then((geo: { features: { properties: { name: string } }[] }) => {
      echarts.registerMap(MAP_NAME, geo as never);
      return geo.features.map((f) => f.properties.name);
    })
    .catch((e) => {
      geoLoad = null;
      throw e;
    });
  return geoLoad;
}

interface DistrictDatum {
  name: string;
  value: number;
  row?: LabelledMetric;
}

/** Dashboard widget: Maharashtra district choropleth (ECharts map); hover a district for its figures. */
@Component({
  selector: 'app-district-map',
  imports: [SkeletonModule, EmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="app-card" [attr.aria-busy]="busy()">
      <h2 class="app-card-title"><i [class]="'pi ' + icon()" aria-hidden="true"></i>{{ title() }}</h2>

      @if (busy()) {
        <p-skeleton width="100%" [height]="height + 'px'" />
      } @else if (failed() || !rows().length) {
        <app-empty-state [title]="t('state.noDataForFilters')" />
      }

      <!-- Kept in the DOM so ECharts keeps its instance across reloads; screen readers use the list below. -->
      <div #chart class="chart" aria-hidden="true" [hidden]="busy() || failed() || !rows().length"></div>

      <ul class="sr-only" [attr.aria-label]="title()">
        @for (r of rows(); track r.label) {
          <li>{{ r.label }}: {{ i18n.number(r.beneficiaries) }} {{ t('chart.total') }}, {{ i18n.currency(r.amount) }}</li>
        }
      </ul>
    </section>
  `,
  styles: `
    :host { display: block; height: 100%; }
    section { height: 100%; }
    /* Box follows the state's own shape, so the map fills the card edge to edge at any width. */
    .chart { width: 100%; aspect-ratio: 1.3; min-height: 300px; }
    .chart[hidden] { display: none; }
  `
})
export class DistrictMapComponent {
  readonly title = input.required<string>();
  readonly icon = input('pi-map');
  readonly rows = input<LabelledMetric[]>([]);
  readonly loading = input(false);

  protected readonly height = CHART_HEIGHT;
  protected readonly i18n = inject(I18nService);
  protected readonly t = this.i18n.t;
  private readonly theme = inject(ThemeService);
  private readonly chartEl = viewChild.required<ElementRef<HTMLDivElement>>('chart');
  private readonly chart = signal<echarts.ECharts | null>(null);
  /** Chart width in px — below NARROW only districts with data are named (all 35 names don't fit on a phone). */
  private readonly width = signal(0);
  /** Data last drawn — bars/areas only animate in when the data changes, not on a theme switch or resize. */
  private drawn: unknown = null;
  /** District names from the boundary file, once loaded. */
  private readonly features = signal<string[] | null>(null);
  protected readonly failed = signal(false);
  protected readonly busy = computed(() => this.loading() || (!this.features() && !this.failed()));

  /** Every district on the map, so all of them draw and show a tooltip; ones with no beneficiaries have no value. */
  private readonly data = computed<DistrictDatum[]>(() => {
    const byKey = new Map<string, LabelledMetric>();
    for (const r of this.rows()) {
      const k = featureKey(r.key ?? r.label);
      const prev = byKey.get(k);
      byKey.set(k, prev ? { ...prev, beneficiaries: prev.beneficiaries + r.beneficiaries, amount: prev.amount + r.amount } : r);
    }
    return (this.features() ?? []).map((name) => {
      const row = byKey.get(norm(name));
      // NaN = "no data": ECharts skips the colour scale and draws the plain (grey) area colour.
      return { name, value: row?.beneficiaries ?? NaN, row };
    });
  });

  constructor() {
    const destroyRef = inject(DestroyRef);

    loadGeo().then(
      (names) => this.features.set(names),
      () => this.failed.set(true)
    );

    afterNextRender(() => {
      const el = this.chartEl().nativeElement;
      const instance = echarts.init(el, null, { renderer: 'svg' });
      const resize = new ResizeObserver(() => {
        instance.resize();
        this.width.set(el.clientWidth);
      });
      resize.observe(el);
      this.chart.set(instance);
      destroyRef.onDestroy(() => {
        resize.disconnect();
        instance.dispose();
      });
    });

    effect(() => {
      const instance = this.chart();
      const data = this.data();
      if (!instance || !data.length || !this.rows().length) return;
      const dark = this.theme.dark();
      const shades = themePalette(this.theme.colour()) as unknown as Record<number, string>;
      const ink = dark ? '#f4f4f5' : '#0f172a';
      const muted = dark ? '#a1a1aa' : '#64748b';
      const border = dark ? '#18181b' : '#ffffff';
      // Districts with no beneficiaries: neutral grey, clearly different from the lightest shade of the scale.
      const empty = dark ? '#3f3f46' : '#e5e7eb';
      const surface = dark ? '#18181b' : '#ffffff';
      const animate = data !== this.drawn;
      this.drawn = data;
      const max = Math.max(1, ...data.map((d) => d.value || 0));
      // Names sit on the district's own fill: light text on the darker half of the scale, muted on empty ones.
      const narrow = this.width() < NARROW;
      const styled = data.map((d) => ({
        ...d,
        label:
          !d.row
            ? { color: muted, show: !narrow }
            : dark || d.value / max > 0.5
              ? // Outline keeps a name readable where it runs past a small district onto the grey around it.
                { color: '#ffffff', textBorderColor: shades[800], textBorderWidth: 2 }
              : { color: ink }
      }));

      // Resize happens after the element is un-hidden; make sure ECharts measures the real box.
      requestAnimationFrame(() => instance.resize());

      instance.setOption(
        {
          animation: animate,
          animationDuration: 400,
          tooltip: {
            trigger: 'item',
            confine: true,
            // Pinned to the empty bottom-right corner (south-east of the state) so it never covers the hovered district.
            position: (_p: unknown, _params: unknown, _dom: unknown, _rect: unknown, size: { contentSize: number[]; viewSize: number[] }) => [
              size.viewSize[0] - size.contentSize[0] - 8,
              size.viewSize[1] - size.contentSize[1] - 36
            ],
            backgroundColor: surface,
            borderColor: dark ? '#3f3f46' : '#e2e8f0',
            textStyle: { color: ink, fontFamily: 'inherit', fontSize: 12 },
            formatter: (p: { data?: DistrictDatum; color?: string }) => this.tooltip(p.data, p.color ?? shades[500])
          },
          visualMap: {
            type: 'continuous',
            min: 1,
            max,
            calculable: false,
            orient: 'horizontal',
            left: 'left',
            bottom: 0,
            itemWidth: 10,
            itemHeight: 120,
            text: [this.i18n.number(max), '1'],
            textStyle: { color: muted, fontFamily: 'inherit', fontSize: 11 },
            inRange: { color: this.scale(shades, dark) },
            outOfRange: { color: empty }
          },
          series: [
            {
              type: 'map',
              map: MAP_NAME,
              roam: false,
              left: 24,
              right: 24,
              top: 8,
              bottom: 28,
              aspectScale: 0.95,
              selectedMode: false,
              label: {
                show: true,
                fontFamily: 'inherit',
                fontSize: 10,
                formatter: (p: { name: string; data?: DistrictDatum }) => p.data?.row?.label ?? p.name
              },
              // Small districts: drop a name rather than let two overlap (the tooltip still names it).
              labelLayout: { hideOverlap: true },
              itemStyle: { areaColor: empty, borderColor: border, borderWidth: 0.8 },
              emphasis: {
                label: {
                  show: true,
                  color: '#ffffff',
                  textBorderColor: shades[800],
                  textBorderWidth: 2,
                  fontFamily: 'inherit',
                  fontSize: 11,
                  fontWeight: 700
                },
                itemStyle: { areaColor: dark ? shades[300] : shades[500], borderColor: ink, borderWidth: 1 }
              },
              data: styled
            }
          ]
        },
        { notMerge: true }
      );
    });
  }

  /**
   * Colour range for the beneficiary scale. A pure-black theme has every shade from 500 up equal to #000,
   * so 300→700 would be mostly flat black — use the lighter half there so districts still read as a gradient.
   */
  private scale(shades: Record<number, string>, dark: boolean): string[] {
    if (shades[600] === shades[800]) return dark ? [shades[400], shades[100]] : [shades[200], shades[500]];
    return dark ? [shades[800], shades[400]] : [shades[300], shades[700]];
  }

  private tooltip(d: DistrictDatum | undefined, colour: string): string {
    if (!d) return '';
    const esc = (v: string) => v.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
    const head =
      `<div style="display:flex;align-items:center;gap:6px;font-weight:600;margin-bottom:2px">` +
      `<span style="width:10px;height:10px;border-radius:3px;background:${colour}"></span>${esc(d.row?.label ?? d.name)}</div>`;
    if (!d.row) return head + `<div style="opacity:.75">${esc(this.t('state.noDataForFilters'))}</div>`;
    return (
      head +
      `<div>${esc(this.t('kpi.beneficiaries'))}: <b>${esc(this.i18n.number(d.row.beneficiaries))}</b></div>` +
      `<div>${esc(this.t('kpi.disbursed'))}: <b>${esc(this.i18n.currency(d.row.amount))}</b></div>`
    );
  }
}
