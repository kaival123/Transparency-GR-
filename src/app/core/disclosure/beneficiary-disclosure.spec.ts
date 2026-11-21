import { maskId, maskName, toBeneficiaryView } from './beneficiary-disclosure';
import { BeneficiaryApiRecord } from '../../models/transparency.models';

const record = (overrides: Partial<BeneficiaryApiRecord> = {}): BeneficiaryApiRecord => ({
  beneficiaryId: 'APP202400123456',
  name: 'Sunita Patil',
  schemeName: 'Khauti',
  financialYear: '2024-25',
  district: 'Nashik',
  taluka: 'Igatpuri',
  village: 'Ghoti',
  benefitAmount: 4000,
  benefitPeriod: { from: '2024-08' },
  lastUpdated: '2024-08-07',
  disclosure: { nameApproved: true, amountApproved: true },
  ...overrides
});

describe('beneficiary disclosure (spec §7)', () => {
  it('masks IDs leaving only the last 4 characters visible', () => {
    const masked = maskId('APP202400123456');
    expect(masked.endsWith('3456')).toBe(true);
    expect(masked).not.toContain('APP');
  });

  it('partially masks names and is idempotent', () => {
    expect(maskName('Sunita Patil')).toBe('Su•••• Pa•••');
    expect(maskName(maskName('Sunita Patil'))).toBe('Su•••• Pa•••');
  });

  it('shows name and amount only when approved', () => {
    const view = toBeneficiaryView(record({ disclosure: { nameApproved: false, amountApproved: false } }));
    expect(view.name).toBe('Su•••• Pa•••');
    expect(view.nameMasked).toBe(true);
    expect(view.benefitAmount).toBeNull();
  });

  it('shows scheme/FY and location as is', () => {
    const view = toBeneficiaryView(record());
    expect(view.name).toBe('Sunita Patil');
    expect(view.scheme).toBe('Khauti');
    expect(view.financialYear).toBe('2024-25');
    expect(view.village).toBe('Ghoti');
    expect(view.taluka).toBe('Igatpuri');
    expect(view.district).toBe('Nashik');
    expect(view.benefitAmount).toBe(4000);
  });

  it('drops any sensitive field the API might send', () => {
    const leaky = { ...record(), aadhaar: '1234 5678 9012', mobile: '9999999999', bankAccount: '000111' };
    const view = toBeneficiaryView(leaky as BeneficiaryApiRecord);
    const serialised = JSON.stringify(view);
    expect(serialised).not.toContain('1234 5678 9012');
    expect(serialised).not.toContain('9999999999');
    expect(serialised).not.toContain('000111');
  });

  it('masks Devanagari names without breaking syllables', () => {
    expect(maskName('सुनीता पाटील')).toBe('सुनी• पाटी•');
    expect(maskName(maskName('सुनीता पाटील'))).toBe('सुनी• पाटी•');
  });

  it('formats year and period in the selected language', () => {
    const en = toBeneficiaryView(record({ benefitPeriod: { from: '2024-04', to: '2025-03' } }), 'en-IN');
    expect(en.financialYear).toBe('2024-25');
    expect(en.benefitPeriod).toBe('Apr 2024 – Mar 2025');
    const mr = toBeneficiaryView(record({ schemeName: 'खावटी' }), 'mr-IN');
    expect(mr.scheme).toBe('खावटी');
    expect(mr.financialYear).toBe('२०२४-२५');
    expect(mr.benefitPeriod).toContain('२०२४');
  });

  it('shows the last-updated date as DD-MM-YY', () => {
    expect(toBeneficiaryView(record(), 'en-IN').lastUpdated).toBe('07-08-24');
    expect(toBeneficiaryView(record(), 'mr-IN').lastUpdated).toBe('०७-०८-२४');
  });
});
