import { DOCUMENT, Injectable, computed, effect, inject, signal } from '@angular/core';
import { PrimeNG } from 'primeng/config';
import { PreferencesService } from '../services/preferences.service';
import {
  formatCount,
  formatCurrency,
  formatCurrencyCompact,
  formatMonthYear,
  localizeDigits
} from '../../shared/utils/format';
import { EN, TranslationKey } from './en';
import { DEFAULT_LANG, LANGUAGES, Lang, LanguageOption, isLang } from './languages';
import { MR } from './mr';
import { PRIMENG_TRANSLATIONS } from './primeng-locales';

const DICTIONARIES: Record<Lang, Record<TranslationKey, string>> = { en: EN, mr: MR };

export type TranslateParams = Record<string, string | number>;

/**
 * Runtime English ⇄ Marathi switching without a reload.
 * Everything that reads `lang()` (templates, API calls, formatters, PrimeNG) updates automatically.
 */
@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly document = inject(DOCUMENT);
  private readonly prefs = inject(PreferencesService);
  private readonly primeng = inject(PrimeNG);

  readonly languages = LANGUAGES;
  readonly lang = signal<Lang>(this.detectInitialLanguage());
  readonly language = computed<LanguageOption>(() => LANGUAGES.find((l) => l.code === this.lang())!);
  readonly locale = computed(() => this.language().locale);

  constructor() {
    effect(() => {
      const lang = this.lang();
      this.document.documentElement.lang = lang;
      this.primeng.setTranslation(PRIMENG_TRANSLATIONS[lang]);
      this.prefs.set('lang', lang);
    });
  }

  setLanguage(lang: Lang): void {
    this.lang.set(lang);
  }

  /** Translate a key; `{name}` placeholders are filled from params (numbers use the current locale). */
  readonly t = (key: TranslationKey, params?: TranslateParams): string => {
    const text = DICTIONARIES[this.lang()][key] ?? EN[key] ?? key;
    if (!params) return text;
    return text.replace(/\{(\w+)\}/g, (match, name: string) => {
      const value = params[name];
      if (value === undefined) return match;
      return typeof value === 'number' ? this.number(value) : value;
    });
  };

  readonly number = (value: number) => formatCount(value, this.locale());
  readonly currency = (value: number) => formatCurrency(value, this.locale());
  readonly currencyCompact = (value: number) => formatCurrencyCompact(value, this.locale());
  readonly monthYear = (yyyyMm: string) => formatMonthYear(yyyyMm, this.locale());
  readonly digits = (text: string) => localizeDigits(text, this.locale());

  /** URL (?lang=mr, for shared links) → saved choice → browser language → English. */
  private detectInitialLanguage(): Lang {
    const fromUrl = new URLSearchParams(this.document.location?.search ?? '').get('lang');
    if (isLang(fromUrl)) return fromUrl;
    const saved = this.prefs.get<string | null>('lang', null);
    if (isLang(saved)) return saved;
    const browser = this.document.defaultView?.navigator?.languages ?? [];
    return browser.some((l) => l.toLowerCase().startsWith('mr')) ? 'mr' : DEFAULT_LANG;
  }
}
