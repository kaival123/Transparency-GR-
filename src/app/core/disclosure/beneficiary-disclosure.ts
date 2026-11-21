import { BeneficiaryApiRecord, BeneficiaryView } from '../../models/transparency.models';
import { formatDateShort, formatMonthYear, localizeDigits } from '../../shared/utils/format';

/**
 * Display rules from spec §7. Masking is primarily done in the data layer; these rules are re-applied
 * here as a defence in depth, and are idempotent on already-masked values.
 */

const MASK = '•';

/** Splits into user-perceived characters, so Devanagari syllables like "सु" are never cut in half. */
function graphemes(text: string): string[] {
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    return [...new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(text)].map((s) => s.segment);
  }
  return [...text];
}

/** "Ramesh Patil" → "Ra•••• Pa•••"; "रमेश पाटील" → "रमे• पाटी•" (first two characters of each word stay visible). */
export function maskName(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((word) => {
      const chars = graphemes(word);
      return chars.length <= 2 ? chars[0] + MASK : chars.slice(0, 2).join('') + MASK.repeat(chars.length - 2);
    })
    .join(' ');
}

/** Only the last 4 characters remain visible. */
export function maskId(id: string): string {
  const visible = id.slice(-4);
  return MASK.repeat(Math.max(id.length - 4, 4)) + visible;
}

/**
 * Builds the view model by copying ONLY allowed fields. Anything else the API might send
 * (Aadhaar, bank account, mobile, email, address, DOB, other IDs) is dropped here.
 * `locale` formats the year, period and digits for the selected language.
 */
export function toBeneficiaryView(record: BeneficiaryApiRecord, locale = 'en-IN'): BeneficiaryView {
  const { nameApproved, amountApproved } = record.disclosure;
  const { from, to } = record.benefitPeriod;
  return {
    id: maskId(record.beneficiaryId),
    name: nameApproved ? record.name : maskName(record.name),
    nameMasked: !nameApproved,
    scheme: record.schemeName,
    financialYear: localizeDigits(record.financialYear, locale),
    village: record.village,
    taluka: record.taluka,
    district: record.district,
    benefitAmount: amountApproved ? record.benefitAmount : null,
    benefitPeriod: to ? `${formatMonthYear(from, locale)} – ${formatMonthYear(to, locale)}` : formatMonthYear(from, locale),
    lastUpdated: formatDateShort(record.lastUpdated, locale)
  };
}
