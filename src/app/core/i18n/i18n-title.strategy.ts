import { Injectable, effect, inject, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { TranslationKey } from './en';
import { I18nService } from './i18n.service';

/** Route `title` values are translation keys; the browser tab title follows the selected language. */
@Injectable({ providedIn: 'root' })
export class I18nTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);
  private readonly i18n = inject(I18nService);
  private readonly key = signal<TranslationKey | null>(null);

  constructor() {
    super();
    effect(() => {
      const key = this.key();
      const app = this.i18n.t('app.name');
      this.title.setTitle(key ? `${this.i18n.t(key)} · ${app}` : app);
    });
  }

  override updateTitle(snapshot: RouterStateSnapshot): void {
    this.key.set((this.buildTitle(snapshot) as TranslationKey | undefined) ?? null);
  }
}
