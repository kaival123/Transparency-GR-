export type Lang = 'en' | 'mr';

export interface LanguageOption {
  code: Lang;
  /** Name in its own script — what a user of that language recognises. */
  nativeName: string;
  englishName: string;
  /** BCP 47 locale for numbers, currency and dates. */
  locale: string;
  short: string;
}

export const LANGUAGES: readonly LanguageOption[] = [
  { code: 'en', nativeName: 'English', englishName: 'English', locale: 'en-IN', short: 'EN' },
  { code: 'mr', nativeName: 'मराठी', englishName: 'Marathi', locale: 'mr-IN', short: 'मरा' }
];

export const DEFAULT_LANG: Lang = 'en';

export const isLang = (value: unknown): value is Lang => LANGUAGES.some((l) => l.code === value);
