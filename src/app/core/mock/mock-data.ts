/**
 * Sample data for the mock backend. NOT used when `useMockApi` is false.
 * Records are generated with a seeded PRNG so numbers are stable across reloads.
 */
import { MasterOption, SchemeOption } from '../../models/master-data.models';
import { DisclosureFlags, SchemeStatus } from '../../models/transparency.models';

export interface MockScheme extends SchemeOption {
  benefitType: string;
  status: SchemeStatus;
  disclosure: DisclosureFlags;
  annualAmount: [number, number];
  femaleOnly?: boolean;
}

export interface MockBeneficiary {
  id: string;
  name: string;
  gender: string;
  schemeId: string;
  fy: string;
  districtId: string;
  talukaId: string;
  villageId: string;
  amount: number;
  period: { from: string; to?: string };
}

export const FINANCIAL_YEARS: MasterOption[] = ['2025-26', '2024-25', '2023-24'].map((v) => ({ value: v, label: `FY ${v}` }));

export const DEPARTMENTS: MasterOption[] = [
  { value: 'SJSA', label: 'Social Justice & Special Assistance Department' },
  { value: 'AGRI', label: 'Agriculture Department' },
  { value: 'TDD', label: 'Tribal Development Department' }
];

export const BENEFIT_TYPES: MasterOption[] = [
  { value: 'PENSION', label: 'Pension (DBT)' },
  { value: 'CASH', label: 'Cash Transfer' },
  { value: 'SUBSIDY', label: 'Input Subsidy' }
];

export const GENDERS: MasterOption[] = [
  { value: 'F', label: 'Female' },
  { value: 'M', label: 'Male' },
  { value: 'T', label: 'Transgender' }
];

export const SCHEMES: MockScheme[] = [
  { value: 'IGNDPS', label: 'Indira Gandhi National Disability Pension Scheme', departmentId: 'SJSA', benefitType: 'PENSION', status: 'Active', disclosure: { nameApproved: true, amountApproved: true }, annualAmount: [12000, 18000] },
  { value: 'IGNWPS', label: 'Indira Gandhi National Widow Pension Scheme', departmentId: 'SJSA', benefitType: 'PENSION', status: 'Active', disclosure: { nameApproved: false, amountApproved: true }, annualAmount: [12000, 18000], femaleOnly: true },
  { value: 'IGNOAPS', label: 'Indira Gandhi Old Age Pension Scheme', departmentId: 'SJSA', benefitType: 'PENSION', status: 'Active', disclosure: { nameApproved: true, amountApproved: true }, annualAmount: [12000, 18000] },
  { value: 'KHAUTI', label: 'Khauti', departmentId: 'TDD', benefitType: 'CASH', status: 'Closed', disclosure: { nameApproved: false, amountApproved: true }, annualAmount: [4000, 4000] },
  { value: 'AGRIDBT', label: 'Agri DBT', departmentId: 'AGRI', benefitType: 'SUBSIDY', status: 'Active', disclosure: { nameApproved: true, amountApproved: false }, annualAmount: [5000, 25000] }
];

const GEOGRAPHY: Record<string, Record<string, string[]>> = {
  Nashik: { Igatpuri: ['Ghoti', 'Wadivarhe', 'Khambale'], Sinnar: ['Dodi', 'Nandur Shingote', 'Vavi'], Niphad: ['Lasalgaon', 'Ozar', 'Pimpalgaon'] },
  Pune: { Haveli: ['Uruli Kanchan', 'Loni Kalbhor', 'Wagholi'], Maval: ['Kamshet', 'Vadgaon', 'Talegaon'], Junnar: ['Narayangaon', 'Otur', 'Ale'] },
  Nandurbar: { Navapur: ['Visarwadi', 'Chinchpada', 'Khandbara'], Shahada: ['Mhasawad', 'Prakasha', 'Sarangkheda'] },
  Palghar: { Dahanu: ['Kasa', 'Chinchani', 'Vangaon'], Jawhar: ['Sakharshet', 'Dhanoshi', 'Kasatwadi'], Wada: ['Kudus', 'Gorhe', 'Khanivali'] }
};

const slug = (s: string) => s.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 6);

export const DISTRICTS: MasterOption[] = Object.keys(GEOGRAPHY).map((d) => ({ value: slug(d), label: d }));

export const TALUKAS: (MasterOption & { districtId: string })[] = Object.entries(GEOGRAPHY).flatMap(([d, t]) =>
  Object.keys(t).map((name) => ({ value: slug(name), label: name, districtId: slug(d) }))
);

export const VILLAGES: (MasterOption & { talukaId: string })[] = Object.values(GEOGRAPHY).flatMap((t) =>
  Object.entries(t).flatMap(([taluka, villages]) => villages.map((v) => ({ value: `${slug(taluka)}-${slug(v)}`, label: v, talukaId: slug(taluka) })))
);

const FIRST_F = ['Sunita', 'Meena', 'Kavita', 'Asha', 'Lata', 'Savita', 'Rekha', 'Shobha', 'Anita', 'Vandana'];
const FIRST_M = ['Ramesh', 'Suresh', 'Ganesh', 'Vijay', 'Prakash', 'Sanjay', 'Dilip', 'Anil', 'Raju', 'Mahesh'];
const LAST = ['Patil', 'Pawar', 'Jadhav', 'Shinde', 'Gavit', 'Valvi', 'More', 'Kale', 'Bhoir', 'Thakare'];

function seededRandom(seed: number): () => number {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

function generateBeneficiaries(count: number): MockBeneficiary[] {
  const rand = seededRandom(42);
  const pick = <T>(arr: readonly T[]): T => arr[Math.floor(rand() * arr.length)];
  return Array.from({ length: count }, (_, i) => {
    const scheme = pick(SCHEMES);
    const village = pick(VILLAGES);
    const taluka = TALUKAS.find((t) => t.value === village.talukaId)!;
    const gender = scheme.femaleOnly ? 'F' : rand() < 0.02 ? 'T' : rand() < 0.5 ? 'F' : 'M';
    const first = gender === 'F' ? pick(FIRST_F) : pick(FIRST_M);
    const fy = pick(FINANCIAL_YEARS).value;
    const [lo, hi] = scheme.annualAmount;
    const startYear = Number(fy.slice(0, 4));
    const isPension = scheme.benefitType === 'PENSION';
    const month = Math.floor(rand() * 12);
    return {
      id: `APP${startYear}${String(100000 + i * 7919).padStart(8, '0')}`,
      name: `${first} ${pick(LAST)}`,
      gender,
      schemeId: scheme.value,
      fy,
      districtId: taluka.districtId,
      talukaId: taluka.value,
      villageId: village.value,
      amount: Math.round((lo + rand() * (hi - lo)) / 100) * 100,
      // FY runs Apr–Mar: month index 0 = April.
      period: isPension
        ? { from: `${startYear}-04`, to: `${startYear + 1}-03` }
        : { from: `${month < 9 ? startYear : startYear + 1}-${String(((month + 3) % 12) + 1).padStart(2, '0')}` }
    };
  });
}

export const BENEFICIARIES: MockBeneficiary[] = generateBeneficiaries(640);
