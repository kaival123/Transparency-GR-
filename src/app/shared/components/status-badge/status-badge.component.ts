import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { TagModule } from 'primeng/tag';
import { TranslationKey } from '../../../core/i18n/en';
import { I18nService } from '../../../core/i18n/i18n.service';

type Severity = 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast';

const SEVERITY: Record<string, Severity> = {
  active: 'success',
  closed: 'secondary',
  upcoming: 'info',
  pending: 'warn',
  rejected: 'danger'
};

/** `status` is the API enum (e.g. "Active"); the colour comes from the enum, the label is translated. */
@Component({
  selector: 'app-status-badge',
  imports: [TagModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<p-tag [value]="label()" [severity]="severity()" [rounded]="true" />`
})
export class StatusBadgeComponent {
  private readonly i18n = inject(I18nService);
  readonly status = input.required<string>();
  protected readonly severity = computed<Severity>(() => SEVERITY[this.status().toLowerCase()] ?? 'secondary');
  protected readonly label = computed(() => {
    const key = `status.${this.status()}` as TranslationKey;
    const text = this.i18n.t(key);
    return text === key ? this.status() : text;
  });
}
