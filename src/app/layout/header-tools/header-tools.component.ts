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

    <div class="pill lang-pill"><app-language-switcher /></div>

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
    /* Measurements match the approved header mock (pills 38px tall, 9px apart, pure white). */
    :host { display: flex; align-items: center; gap: 9px; flex-wrap: wrap; justify-content: flex-end; }
    .pill {
      display: inline-flex; align-items: center; gap: 0.375rem;
      min-height: 38px; padding: 0 17px; font-size: 13px;
      background: #fff;
      border-radius: 8px; color: #333;
    }
    :host-context(.app-dark) .pill { background: var(--app-card); color: var(--app-text); }
    /* Visible pill on tablet/desktop, like the other tools. */
    /* Not shown in the bar; appears only when reached with Tab (GIGW skip link for keyboard / screen-reader users). */
    .skip { position: absolute; left: -999px; text-decoration: none; font-weight: 400; font-size: 13px; }
    .skip:focus { left: 0.5rem; top: 0.5rem; z-index: 1000; box-shadow: 0 2px 8px rgb(0 0 0 / 0.15); outline: 2px solid var(--p-primary-color); outline-offset: 2px; }

    .icon-btn {
      border: 0; background: none; color: inherit; font: inherit; cursor: pointer;
      min-width: 0; height: 1.875rem; padding: 0 2px; border-radius: 6px; display: grid; place-items: center;
    }
    .icon-btn:disabled { opacity: 0.4; cursor: default; }
    .icon-btn:focus-visible { outline: 2px solid var(--p-primary-color); outline-offset: 1px; }
    .icon-btn .pi { font-size: 13px; }
    .aa { font-weight: 400; font-size: 13px; padding: 0; }
    /* − Aa +  : 14px edge, ~17px between items (112px pill). */
    .text-size { padding: 0 12px; gap: 15px; }

    .lang-pill { padding: 0 13px 0 15px; }
    .lang-pill ::ng-deep .p-select { border: 0; box-shadow: none; background: transparent; height: 38px; align-items: center; }
    .lang-pill ::ng-deep .p-select-label { font-size: 13px; padding: 0; color: inherit; display: flex; align-items: center; line-height: 1; }
    /* Small solid caret 8px after the language name. */
    .lang-pill ::ng-deep .p-select-dropdown { width: auto; padding-left: 6px; color: inherit; }
    .lang-pill ::ng-deep .p-select-dropdown .pi { font-size: 8px; transform: translateY(3px); } /* glyph sits high in its box */

    .colours { gap: 9px; padding: 0 13px; }
    .colours-label { font-weight: 400; font-size: 13px; margin-right: 1px; }
    .swatch {
      width: 20px; height: 20px; border-radius: 4px; border: 0; cursor: pointer;
      display: grid; place-items: center; color: #fff; padding: 0;
    }
    /* Selected colour shows only the white tick (no ring); keyboard focus still gets an outline. */
    .swatch:focus-visible { outline: 2px solid var(--app-text); outline-offset: 2px; }
    .swatch .pi { font-size: 12px; font-weight: 900; }

    /* Phones + tablets (no sidebar): the three tools sit on their own row and share it evenly. */
    @media (max-width: 1023.98px) {
      :host { flex-wrap: nowrap; }
      .pill:not(.skip) { flex: 1 1 auto; justify-content: center; }
    }
    @media (max-width: 767.98px) {
      /* Phones: no room for it in the bar — hidden until reached with Tab. */
      .pill { min-height: 2rem; font-size: 0.85rem; }
      .icon-btn { min-width: 1.6rem; height: 1.6rem; }
      .icon-btn .pi { font-size: 0.75rem; }
      .text-size { gap: 0.25rem; }
      .lang-pill ::ng-deep .p-select { font-size: 0.85rem; }
      .swatch { width: 1.25rem; height: 1.25rem; }
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
      .lang-pill ::ng-deep .p-select-label { padding-inline: 0.25rem; }
      .lang-pill ::ng-deep .p-select-dropdown { width: 1.25rem; }
      .colours { gap: 0.25rem; }
      .swatch { width: 1rem; height: 1rem; }
      .swatch:focus-visible { outline-offset: 1px; }
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
