import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { SelectModule } from 'primeng/select';
import { I18nService } from '../../../core/i18n/i18n.service';
import { Lang } from '../../../core/i18n/languages';

/**
 * Header language picker. Each language is listed in its own script (English / मराठी) with the other
 * name as a hint, so anyone can find their language whatever is currently shown.
 */
@Component({
  selector: 'app-language-switcher',
  imports: [FormsModule, SelectModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p-select
      [options]="i18n.languages"
      optionLabel="nativeName"
      optionValue="code"
      [ngModel]="i18n.lang()"
      (ngModelChange)="change($event)"
      [ariaLabel]="i18n.t('lang.label')"
      size="small"
      dropdownIcon="pi pi-sort-down-fill"
      appendTo="body"
      styleClass="lang-select"
      panelStyleClass="lang-panel">
      <ng-template #selectedItem let-option>
        <span class="selected">
          <!-- Translate glyph from public/images/language-translate.svg, inlined so it follows the text colour (dark mode). -->
          <svg class="lang-icon" viewBox="0 0 19 20" aria-hidden="true" focusable="false">
            <path fill="currentColor" d="M18 10h-2a1 1 0 0 0 0 2v2h-1.185A3 3 0 0 0 15 13a3 3 0 0 0-5.598-1.5 1 1 0 1 0 1.732 1A1 1 0 1 1 12 14a1 1 0 0 0 0 2 1 1 0 1 1-.866 1.5 1 1 0 1 0-1.732 1A3 3 0 0 0 15 17a3 3 0 0 0-.185-1H16v3a1 1 0 0 0 2 0v-7a1 1 0 0 0 0-2M6.03 9.243a1 1 0 1 0 1.94-.486l-1.757-7.03a2.280 2.280 0 0 0-4.425 0L.03 8.758a1 1 0 1 0 1.940.486L2.53 7h2.94zM3.030 5l.697-2.787a.292.292 0 0 1 .546 0L4.970 5zM11 5h1a1 1 0 0 1 1 1v1a1 1 0 0 0 2 0V6a3.003 3.003 0 0 0-3-3h-1a1 1 0 0 0 0 2m-4 9H6a1 1 0 0 1-1-1v-1a1 1 0 1 0-2 0v1a3.003 3.003 0 0 0 3 3h1a1 1 0 0 0 0-2"/>
          </svg>
          <span class="full" [attr.lang]="option.code">{{ option.nativeName }}</span>
          <span class="short" [attr.lang]="option.code" aria-hidden="true">{{ option.short }}</span>
        </span>
      </ng-template>
      <ng-template #item let-option>
        <span class="item" [attr.lang]="option.code">
          <span class="native">{{ option.nativeName }}</span>
          @if (option.nativeName !== option.englishName) {
            <span class="english" lang="en">{{ option.englishName }}</span>
          }
          @if (option.code === i18n.lang()) {
            <i class="pi pi-check check" aria-hidden="true"></i>
          }
        </span>
      </ng-template>
    </p-select>
  `,
  styles: `
    .selected { display: inline-flex; align-items: center; gap: 8px; }
    .lang-icon { width: 19px; height: 20px; flex: none; color: inherit; }
    .short { display: none; }
    .item { display: flex; align-items: baseline; gap: 0.6rem; width: 100%; min-width: 9rem; }
    .native { font-weight: 600; }
    .english { font-size: 0.75rem; color: var(--app-muted); }
    .check { margin-left: auto; font-size: 0.75rem; color: var(--p-primary-color); }
    @media (max-width: 480px) {
      .full { display: none; }
      .short { display: inline; }
    }
  `
})
export class LanguageSwitcherComponent {
  protected readonly i18n = inject(I18nService);
  private readonly messages = inject(MessageService);
  private readonly router = inject(Router);

  protected change(lang: Lang): void {
    if (!lang || lang === this.i18n.lang()) return;
    this.i18n.setLanguage(lang);
    // A ?lang= in the URL wins on reload, so keep it in step with the choice.
    if (this.router.parseUrl(this.router.url).queryParamMap.has('lang')) {
      void this.router.navigate([], { queryParams: { lang }, queryParamsHandling: 'merge', replaceUrl: true });
    }
    // Confirm in the newly selected language.
    this.messages.add({ key: 'global', severity: 'info', summary: this.i18n.t('lang.changed'), detail: this.i18n.t('lang.changedDetail'), life: 2500 });
  }
}
