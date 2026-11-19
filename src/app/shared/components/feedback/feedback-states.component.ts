import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { I18nService } from '../../../core/i18n/i18n.service';

@Component({
  selector: 'app-empty-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="state" role="status">
      <i [class]="'pi ' + icon()" aria-hidden="true"></i>
      <strong>{{ title() || t('state.empty') }}</strong>
      <span class="text-muted">{{ message() ?? t('state.emptyHint') }}</span>
      <ng-content />
    </div>
  `,
  styleUrl: './feedback-states.css'
})
export class EmptyStateComponent {
  protected readonly t = inject(I18nService).t;
  /** Defaults to the translated "No data found". */
  readonly title = input<string>();
  /** Defaults to the translated hint; pass '' to hide. */
  readonly message = input<string>();
  readonly icon = input('pi-inbox');
}

@Component({
  selector: 'app-error-state',
  imports: [ButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="state error" role="alert">
      <i class="pi pi-exclamation-triangle" aria-hidden="true"></i>
      <strong>{{ t('state.errorTitle') }}</strong>
      <span class="text-muted">{{ message() || t('state.errorMessage') }}</span>
      <p-button [label]="t('state.retry')" icon="pi pi-refresh" severity="secondary" [outlined]="true" size="small" (onClick)="retry.emit()" />
    </div>
  `,
  styleUrl: './feedback-states.css'
})
export class ErrorStateComponent {
  protected readonly t = inject(I18nService).t;
  readonly message = input<string>();
  readonly retry = output<void>();
}
