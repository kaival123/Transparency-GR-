import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-stat-card',
  imports: [SkeletonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="app-card stat" [attr.aria-busy]="loading()">
      <div class="icon" aria-hidden="true"><i [class]="'pi ' + icon()"></i></div>
      <div class="body">
        <span class="label text-muted">{{ label() }}</span>
        @if (loading()) {
          <p-skeleton width="7rem" height="1.75rem" />
        } @else {
          <span class="value app-fade-in" [attr.title]="hint() || null">{{ value() }}</span>
        }
      </div>
    </div>
  `,
  styles: `
    .stat { display: flex; gap: 1rem; align-items: center; height: 100%; }
    .icon {
      flex: none; width: 44px; height: 44px; border-radius: 10px; display: grid; place-items: center;
      background: color-mix(in srgb, var(--p-primary-color) 12%, transparent); color: var(--p-primary-color);
    }
    .icon .pi { font-size: 1.15rem; }
    .body { display: flex; flex-direction: column; gap: 0.25rem; min-width: 0; }
    .label { font-size: 0.8rem; font-weight: 500; }
    .value { font-size: clamp(1.25rem, 1.1rem + 0.6vw, 1.75rem); font-weight: 700; line-height: 1.2; overflow-wrap: anywhere; }
  `
})
export class StatCardComponent {
  readonly label = input.required<string>();
  readonly value = input<string>('');
  readonly icon = input<string>('pi-chart-bar');
  readonly hint = input<string>();
  readonly loading = input(false);
}
