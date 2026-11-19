import { TestBed } from '@angular/core/testing';
import { EN, TranslationKey } from './en';
import { I18nService } from './i18n.service';
import { MR } from './mr';

const placeholders = (text: string) => (text.match(/\{\w+\}/g) ?? []).sort().join(',');

describe('i18n (English ⇄ Marathi)', () => {
  it('Marathi has exactly the same keys as English, none empty', () => {
    expect(Object.keys(MR).sort()).toEqual(Object.keys(EN).sort());
    for (const [key, value] of Object.entries(MR)) expect(value.trim(), key).not.toBe('');
  });

  it('keeps every placeholder in each translation', () => {
    for (const key of Object.keys(EN) as TranslationKey[]) {
      expect(placeholders(MR[key]), key).toBe(placeholders(EN[key]));
    }
  });

  it('Marathi strings are actually translated (Devanagari), except brand/format tokens', () => {
    const allowedLatin: TranslationKey[] = ['table.pageReport'];
    for (const key of Object.keys(MR) as TranslationKey[]) {
      if (allowedLatin.includes(key)) continue;
      expect(/[ऀ-ॿ]/.test(MR[key]), key).toBe(true);
    }
  });

  it('switches language, interpolates and formats numbers per locale', () => {
    const i18n = TestBed.inject(I18nService);
    i18n.setLanguage('en');
    expect(i18n.t('filters.minChars', { n: 3 })).toBe('Minimum 3 characters');
    expect(i18n.number(123456)).toBe('1,23,456');
    i18n.setLanguage('mr');
    expect(i18n.t('filters.minChars', { n: 3 })).toBe('किमान ३ अक्षरे');
    expect(i18n.number(123456)).toBe('१,२३,४५६');
    expect(i18n.currencyCompact(7930000)).toContain('लाख');
  });
});
