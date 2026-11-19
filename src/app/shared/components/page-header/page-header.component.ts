import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { I18nService } from '../../../core/i18n/i18n.service';

@Component({
  selector: 'app-page-header',
  imports: [BreadcrumbModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="page-header">
      @if (breadcrumbs().length) {
        <p-breadcrumb [model]="breadcrumbs()" [home]="home()" styleClass="crumbs" [ariaLabel]="t('nav.breadcrumb')" />
      }
      <div class="row">
        <div>
          <h1>{{ title() }}</h1>
          @if (subtitle()) { <p class="text-muted">{{ subtitle() }}</p> }
        </div>
        <div class="actions"><ng-content /></div>
      </div>
    </header>
  `,
  styles: `
    .page-header { display: flex; flex-direction: column; gap: 0.5rem; }
    :host ::ng-deep .crumbs { background: transparent; padding: 0; }
    .row { display: flex; flex-wrap: wrap; gap: 1rem; align-items: flex-end; justify-content: space-between; }
    p { margin: 0.25rem 0 0; }
    .actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .actions:empty { display: none; }
    h1, p { overflow-wrap: anywhere; }
    @media (max-width: 640px) {
      .row { align-items: stretch; }
      .actions, .actions > * { width: 100%; }
      .actions ::ng-deep .p-button { width: 100%; }
    }
  `
})
export class PageHeaderComponent {
  readonly title = input.required<string>();
  readonly subtitle = input<string>();
  readonly breadcrumbs = input<MenuItem[]>([]);
  protected readonly t = inject(I18nService).t;
  protected readonly home = computed<MenuItem>(() => ({ icon: 'pi pi-home', routerLink: '/dashboard', queryParamsHandling: 'preserve', ariaLabel: this.t('nav.home') }) as MenuItem);
}
