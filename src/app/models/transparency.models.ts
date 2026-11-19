export interface Page<T> {
  items: T[];
  total: number;
}

export interface LabelledMetric {
  label: string;
  beneficiaries: number;
  amount: number;
}

export interface DashboardSummary {
  totalBeneficiaries: number;
  totalAmount: number;
  activeSchemes: number;
  districtsCovered: number;
  byScheme: LabelledMetric[];
  byDistrict: LabelledMetric[];
  /** Present only when gender disclosure is approved (spec §6, #9). */
  byGender?: LabelledMetric[];
}

export type SchemeStatus = 'Active' | 'Closed' | 'Upcoming';

export interface SchemeDirectoryRow {
  id: string;
  scheme: string;
  department: string;
  benefitType: string;
  beneficiaries: number;
  amount: number;
  status: SchemeStatus;
}

/** Per-scheme disclosure decision made by the data-owning department (spec §7). */
export interface DisclosureFlags {
  nameApproved: boolean;
  amountApproved: boolean;
}

export interface BenefitPeriod {
  from: string;
  to?: string;
}

/** Beneficiary record as received from the API (already masked in the data layer). */
export interface BeneficiaryApiRecord {
  beneficiaryId: string;
  name: string;
  schemeName: string;
  financialYear: string;
  district: string;
  taluka: string;
  village: string;
  benefitAmount: number | null;
  /** Month of benefit, or a period ("YYYY-MM"); formatted per locale in the UI. */
  benefitPeriod: BenefitPeriod;
  disclosure: DisclosureFlags;
}

/** The only beneficiary fields the portal is allowed to display (spec §7). */
export interface BeneficiaryView {
  id: string;
  name: string;
  nameMasked: boolean;
  schemeAndYear: string;
  location: string;
  benefitAmount: number | null;
  benefitPeriod: string;
}
