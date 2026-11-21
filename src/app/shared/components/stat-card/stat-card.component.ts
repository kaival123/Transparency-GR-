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
      @if (badge()) {
        <span class="badge">{{ badge() }}</span>
      }
    </div>
  `,
  styles: `
    :host { display: block; container: stat / inline-size; }
    .stat { position: relative; display: flex; gap: 1rem; align-items: center; height: 100%; }
    .icon {
      flex: none; width: 44px; height: 44px; border-radius: 10px; display: grid; place-items: center;
      background: color-mix(in srgb, var(--p-primary-color) 12%, transparent); color: var(--p-primary-color);
    }
    .icon .pi { font-size: 1.15rem; }
    .body { display: flex; flex-direction: column; gap: 0.25rem; min-width: 0; }
    .label { font-size: 0.8rem; font-weight: 500; }
    .value { font-size: clamp(1.25rem, 1.1rem + 0.6vw, 1.75rem); font-weight: 700; line-height: 1.2; overflow-wrap: anywhere; }
    /* Unit label (e.g. "INR") pinned to the card's top-right corner. */
    .badge {
      position: absolute; top: 0.75rem; right: 1rem;
      font-size: 0.75rem; font-weight: 700; letter-spacing: 0.04em; color: var(--p-primary-color);
    }
    /* Narrow card (two-up on phones): icon above the text, smaller, so label and value get the full width. */
    @container stat (max-width: 220px) {
      .stat { flex-direction: column; align-items: flex-start; gap: 0.5rem; }
      .icon { width: 36px; height: 36px; border-radius: 8px; }
      .icon .pi { font-size: 1rem; }
      .label { font-size: 0.75rem; }
    }
  `
})
export class StatCardComponent {
  readonly label = input.required<string>();
  readonly value = input<string>('');
  readonly icon = input<string>('pi-chart-bar');
  /** Short unit label (e.g. "INR") shown in the card's top-right corner. */
  readonly badge = input<string>();
  readonly hint = input<string>();
  readonly loading = input(false);
}
