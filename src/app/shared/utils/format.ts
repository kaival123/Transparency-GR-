/** Locale-aware formatters. Formatter instances are cached per locale (they are expensive to create). */
const cache = new Map<string, Intl.NumberFormat | Intl.DateTimeFormat>();

function get<T extends Intl.NumberFormat | Intl.DateTimeFormat>(key: string, create: () => T): T {
  let f = cache.get(key) as T | undefined;
  if (!f) {
    f = create();
    cache.set(key, f);
  }
  return f;
}

export const formatCurrency = (value: number, locale = 'en-IN') =>
  get(`cur|${locale}`, () => new Intl.NumberFormat(locale, { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })).format(value);

export const formatCurrencyCompact = (value: number, locale = 'en-IN') =>
  get(`curc|${locale}`, () => new Intl.NumberFormat(locale, { style: 'currency', currency: 'INR', notation: 'compact', maximumFractionDigits: 1 })).format(value);

export const formatCount = (value: number, locale = 'en-IN') =>
  get(`num|${locale}`, () => new Intl.NumberFormat(locale)).format(value);

/** "2025-04" → "Apr 2025" / "एप्रि २०२५". */
export const formatMonthYear = (yyyyMm: string, locale = 'en-IN') => {
  const [y, m] = yyyyMm.split('-').map(Number);
  return get(`my|${locale}`, () => new Intl.DateTimeFormat(locale, { month: 'short', year: 'numeric' })).format(new Date(y, (m || 1) - 1, 1));
};

/** Converts ASCII digits inside text (e.g. "2024-25") to the locale's digits ("२०२४-२५"). */
export const localizeDigits = (text: string, locale = 'en-IN') => {
  const fmt = get(`dig|${locale}`, () => new Intl.NumberFormat(locale, { useGrouping: false }));
  return text.replace(/\d/g, (d) => fmt.format(Number(d)));
};
