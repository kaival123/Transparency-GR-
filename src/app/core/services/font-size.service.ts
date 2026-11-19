import { DOCUMENT, Injectable, computed, effect, inject, signal } from '@angular/core';
import { PreferencesService } from './preferences.service';

/** Root font sizes (percent of the browser default). All app sizes are in rem, so everything scales. */
const STEPS = [87.5, 100, 112.5, 125, 137.5] as const;
const DEFAULT_STEP = 1;

/** A-/A/A+ text resizing (GIGW). The choice is remembered per browser. */
@Injectable({ providedIn: 'root' })
export class FontSizeService {
  private readonly document = inject(DOCUMENT);
  private readonly prefs = inject(PreferencesService);

  private readonly step = signal(this.clamp(this.prefs.get('fontStep', DEFAULT_STEP)));
  readonly canDecrease = computed(() => this.step() > 0);
  readonly canIncrease = computed(() => this.step() < STEPS.length - 1);
  readonly isDefault = computed(() => this.step() === DEFAULT_STEP);

  constructor() {
    effect(() => {
      const step = this.step();
      this.document.documentElement.style.fontSize = step === DEFAULT_STEP ? '' : `${STEPS[step]}%`;
      this.prefs.set('fontStep', step);
    });
  }

  decrease(): void {
    this.step.update((s) => this.clamp(s - 1));
  }

  increase(): void {
    this.step.update((s) => this.clamp(s + 1));
  }

  reset(): void {
    this.step.set(DEFAULT_STEP);
  }

  private clamp(step: number): number {
    return Number.isInteger(step) ? Math.min(Math.max(step, 0), STEPS.length - 1) : DEFAULT_STEP;
  }
}
