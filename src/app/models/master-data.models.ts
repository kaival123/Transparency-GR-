/** A value/label pair returned by the master data APIs. */
export interface MasterOption {
  value: string;
  label: string;
}

export interface SchemeOption extends MasterOption {
  departmentId: string;
}
