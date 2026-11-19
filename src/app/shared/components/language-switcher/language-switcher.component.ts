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
      appendTo="body"
      styleClass="lang-select"
      panelStyleClass="lang-panel">
      <ng-template #selectedItem let-option>
        <span class="selected">
          <!-- "A ↔ अ" translate glyph (Latin + Devanagari) -->
          <svg class="lang-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <text x="1.5" y="11.5" font-size="11.5" font-weight="600" font-family="Inter, 'Segoe UI', system-ui, sans-serif" fill="currentColor">A</text>
            <path d="M10.6 8.2c.7-1.1 1.5-1.1 2.2 0s1.5 1.1 2.2 0" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />
            <text x="9.2" y="21.5" font-size="12" font-weight="600" font-family="'Nirmala UI', 'Noto Sans Devanagari', Mangal, sans-serif" fill="currentColor">अ</text>
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
    .selected { display: inline-flex; align-items: center; gap: 0.45rem; }
    .lang-icon { width: 1.6em; height: 1.6em; flex: none; color: var(--app-text); overflow: visible; }
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
