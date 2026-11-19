/** Pages of the portal. Used to decide which filters apply where (spec §6 "Applies to"). */
export type PageKey = 'dashboard' | 'directory' | 'beneficiaries';

/** Selected filter values. Single-selects are `string | null`, multi-selects are `string[]`. */
export interface FilterState {
  fy: string | null;
  dept: string[];
  scheme: string | null;
  district: string | null;
  taluka: string | null;
  village: string | null;
  name: string;
  benefitType: string[];
  gender: string[];
}

export type FilterKey = keyof FilterState;

export type FilterControlType = 'single' | 'multi' | 'searchable' | 'text';

export interface FilterDefinition {
  key: FilterKey;
  label: string;
  type: FilterControlType;
  /** URL query-param name, so a filtered view can be shared. */
  param: string;
  appliesTo: readonly PageKey[];
  dependsOn?: FilterKey;
  minLength?: number;
  /** Shown in the results table's toolbar instead of the Filters panel. */
  placement?: 'table';
  /** Optional filters (spec §6, #8 and #9) are shown only when enabled and master data exists. */
  optional?: boolean;
}

export const EMPTY_FILTERS: FilterState = {
  fy: null,
  dept: [],
  scheme: null,
  district: null,
  taluka: null,
  village: null,
  name: '',
  benefitType: [],
  gender: []
};

const ALL_PAGES: readonly PageKey[] = ['dashboard', 'directory', 'beneficiaries'];

/**
 * Single source of truth for the filters in spec §6.
 * "Search" and "beneficiary list" are served by the Beneficiaries page.
 */
export const FILTER_DEFINITIONS: readonly FilterDefinition[] = [
  { key: 'fy', label: 'Financial Year', type: 'single', param: 'fy', appliesTo: ALL_PAGES },
  { key: 'dept', label: 'Department', type: 'multi', param: 'dept', appliesTo: ['dashboard', 'directory', 'beneficiaries'] },
  { key: 'scheme', label: 'Scheme', type: 'searchable', param: 'scheme', appliesTo: ALL_PAGES, dependsOn: 'dept' },
  { key: 'district', label: 'District', type: 'single', param: 'district', appliesTo: ALL_PAGES },
  { key: 'taluka', label: 'Taluka', type: 'single', param: 'taluka', appliesTo: ['dashboard', 'beneficiaries'], dependsOn: 'district' },
  { key: 'village', label: 'Village', type: 'single', param: 'village', appliesTo: ['dashboard', 'beneficiaries'], dependsOn: 'taluka' },
  { key: 'name', label: 'Beneficiary Name', type: 'text', param: 'q', appliesTo: ['beneficiaries'], minLength: 3, placement: 'table' },
  { key: 'benefitType', label: 'Benefit Type', type: 'multi', param: 'bt', appliesTo: ['dashboard', 'directory'], optional: true },
  { key: 'gender', label: 'Gender', type: 'multi', param: 'gender', appliesTo: ['dashboard'], optional: true }
];

/** Children that must be cleared when a parent filter changes. */
export const DEPENDENT_FILTERS: Partial<Record<FilterKey, FilterKey[]>> = {
  dept: ['scheme'],
  district: ['taluka', 'village'],
  taluka: ['village']
};
