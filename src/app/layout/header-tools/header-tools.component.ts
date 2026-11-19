import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { I18nService } from '../../core/i18n/i18n.service';
import { FontSizeService } from '../../core/services/font-size.service';
import { THEME_COLOURS, ThemeService } from '../../core/services/theme.service';
import { LanguageSwitcherComponent } from '../../shared/components/language-switcher/language-switcher.component';

/** Header accessibility tools (GIGW): skip link, text resizing, language and colour theme. */
@Component({
  selector: 'app-header-tools',
  imports: [LanguageSwitcherComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a class="pill skip" href="#main">{{ t('a11y.skipMain') }}</a>

    <div class="pill text-size" role="group" [attr.aria-label]="t('a11y.textSize')">
      <button type="button" class="icon-btn" (click)="font.decrease()" [disabled]="!font.canDecrease()"
              [attr.aria-label]="t('a11y.textSmaller')" [title]="t('a11y.textSmaller')">
        <i class="pi pi-minus" aria-hidden="true"></i>
      </button>
      <button type="button" class="icon-btn aa" (click)="font.reset()"
              [attr.aria-label]="t('a11y.textReset')" [title]="t('a11y.textReset')">Aa</button>
      <button type="button" class="icon-btn" (click)="font.increase()" [disabled]="!font.canIncrease()"
              [attr.aria-label]="t('a11y.textLarger')" [title]="t('a11y.textLarger')">
        <i class="pi pi-plus" aria-hidden="true"></i>
      </button>
    </div>

    <div class="pill lang"><app-language-switcher /></div>

    <div class="pill colours" role="radiogroup" [attr.aria-label]="t('theme.colour')">
      <span class="colours-label" aria-hidden="true">{{ t('theme.label') }}</span>
      @for (c of colours; track c.id) {
        <button type="button" role="radio" class="swatch" [style.background]="c.hex"
                [attr.aria-checked]="theme.colour() === c.id" [attr.aria-label]="t(c.label)" [title]="t(c.label)"
                (click)="theme.setColour(c.id)">
          @if (theme.colour() === c.id) {
            <i class="pi pi-check" aria-hidden="true"></i>
          }
        </button>
      }
    </div>
  `,
  styles: `
    :host { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; justify-content: flex-end; }
    .pill {
      display: inline-flex; align-items: center; gap: 0.25rem;
      min-height: 2rem; padding: 0 0.5rem; font-size: 0.85rem;
      background: var(--app-card); /* white pills on the tinted header */
      border-radius: 8px; color: var(--app-text);
    }
    /* Hidden until reached with Tab (keyboard / screen-reader users still need it). */
    .skip { position: absolute; left: -999px; text-decoration: none; font-weight: 500; }
    .skip:focus { left: 0.5rem; top: 0.5rem; z-index: 1000; box-shadow: 0 2px 8px rgb(0 0 0 / 0.15); }

    .icon-btn {
      border: 0; background: none; color: inherit; font: inherit; cursor: pointer;
      min-width: 1.6rem; height: 1.6rem; border-radius: 6px; display: grid; place-items: center;
    }
    .icon-btn:hover:not(:disabled) { background: color-mix(in srgb, var(--p-primary-color) 14%, transparent); }
    .icon-btn:disabled { opacity: 0.4; cursor: default; }
    .icon-btn .pi { font-size: 0.75rem; }
    .aa { font-weight: 600; padding: 0 0.25rem; }

    .lang { padding: 0; }
    .lang ::ng-deep .p-select { border: 0; box-shadow: none; background: transparent; font-size: 0.85rem; }
    .lang ::ng-deep .p-select-label { padding-block: 0.25rem; }

    .colours { gap: 0.4rem; }
    .colours-label { font-weight: 500; margin-right: 0.25rem; }
    .swatch {
      width: 1.25rem; height: 1.25rem; border-radius: 4px; border: 0; cursor: pointer;
      display: grid; place-items: center; color: #fff; padding: 0;
    }
    .swatch[aria-checked='true'] { outline: 2px solid var(--app-text); outline-offset: 2px; }
    .swatch .pi { font-size: 0.65rem; font-weight: 700; }

    @media (max-width: 767.98px) {
      :host { gap: 0.375rem; }
      .pill { padding: 0 0.375rem; }
      .colours-label { display: none; }
      .colours { gap: 0.3rem; }
      .swatch { width: 1.125rem; height: 1.125rem; }
    }
    /* Small phones (320–419px): everything still fits on one row. */
    @media (max-width: 419.98px) {
      :host { gap: 0.25rem; }
      .pill { padding: 0 0.25rem; min-height: 1.875rem; }
      .icon-btn { min-width: 1.375rem; height: 1.375rem; }
      .aa { padding: 0 0.125rem; }
      .lang ::ng-deep .p-select-label { padding-inline: 0.25rem; }
      .lang ::ng-deep .p-select-dropdown { width: 1.25rem; }
      .colours { gap: 0.25rem; }
      .swatch { width: 1rem; height: 1rem; }
      .swatch[aria-checked='true'] { outline-offset: 1px; }
    }
  `
})
export class HeaderToolsComponent {
  protected readonly i18n = inject(I18nService);
  protected readonly t = this.i18n.t;
  protected readonly font = inject(FontSizeService);
  protected readonly theme = inject(ThemeService);
  protected readonly colours = THEME_COLOURS;
}
