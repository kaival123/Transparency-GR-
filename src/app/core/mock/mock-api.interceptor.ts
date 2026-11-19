import { HttpInterceptorFn, HttpParams, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { delay, of } from 'rxjs';
import { APP_SETTINGS } from '../config/app-settings';
import { maskId, maskName } from '../disclosure/beneficiary-disclosure';
import {
  BeneficiaryApiRecord,
  DashboardSummary,
  LabelledMetric,
  Page,
  SchemeDirectoryRow
} from '../../models/transparency.models';
import { MasterOption } from '../../models/master-data.models';
import {
  BENEFICIARIES,
  BENEFIT_TYPES,
  DEPARTMENTS,
  DISTRICTS,
  FINANCIAL_YEARS,
  GENDERS,
  MockBeneficiary,
  SCHEMES,
  TALUKAS,
  VILLAGES
} from './mock-data';
import { MockLang, fyLabel, langFrom, localize } from './mock-i18n';

/**
 * In-browser stand-in for the transparency backend, active only when `useMockApi` is true.
 * It mimics the contract the real API must honour: data-layer masking (spec §7) and labels
 * localised per the `Accept-Language` header.
 */
export const mockApiInterceptor: HttpInterceptorFn = (req, next) => {
  const { apiBaseUrl, useMockApi } = inject(APP_SETTINGS);
  if (!useMockApi || !req.url.startsWith(apiBaseUrl)) return next(req);

  const lang = langFrom(req.headers.get('Accept-Language'));
  const body = route(req.url.slice(apiBaseUrl.length), req.params, lang);
  if (body === undefined) return next(req);
  return of(new HttpResponse({ status: 200, body })).pipe(delay(350));
};

function route(path: string, p: HttpParams, lang: MockLang): unknown {
  const [pathname, query] = path.split('?');
  const inline = new HttpParams({ fromString: query ?? '' });
  const options = (list: MasterOption[]) => list.map(({ value, label }) => ({ value, label: localize(label, lang) }));
  switch (pathname) {
    case '/master/financial-years': return FINANCIAL_YEARS.map(({ value }) => ({ value, label: fyLabel(value, lang) }));
    case '/master/departments': return options(DEPARTMENTS);
    case '/master/districts': return options(DISTRICTS);
    case '/master/benefit-types': return options(BENEFIT_TYPES);
    case '/master/genders': return options(GENDERS);
    case '/master/schemes': {
      const depts = list(p, 'departmentIds');
      return SCHEMES.filter((s) => !depts.length || depts.includes(s.departmentId))
        .map(({ value, label, departmentId }) => ({ value, label: localize(label, lang), departmentId }));
    }
    case '/master/talukas': return options(TALUKAS.filter((t) => t.districtId === inline.get('districtId')));
    case '/master/villages': return options(VILLAGES.filter((v) => v.talukaId === inline.get('talukaId')));
    case '/dashboard/summary': return dashboard(p, lang);
    case '/schemes/directory': return directory(p, lang);
    case '/beneficiaries': return beneficiaries(p, lang);
    default: return undefined;
  }
}

const list = (p: HttpParams, key: string) => (p.get(key) ?? '').split(',').filter(Boolean);
const schemeOf = (b: MockBeneficiary) => SCHEMES.find((s) => s.value === b.schemeId)!;
const labelOf = (options: MasterOption[], value: string, lang: MockLang) =>
  localize(options.find((o) => o.value === value)?.label ?? value, lang);

function filterRecords(p: HttpParams): MockBeneficiary[] {
  const depts = list(p, 'dept');
  const types = list(p, 'benefitType');
  const genders = list(p, 'gender');
  const name = (p.get('name') ?? '').toLowerCase();
  return BENEFICIARIES.filter((b) => {
    const s = schemeOf(b);
    return (
      (!p.get('fy') || b.fy === p.get('fy')) &&
      (!depts.length || depts.includes(s.departmentId)) &&
      (!p.get('scheme') || b.schemeId === p.get('scheme')) &&
      (!p.get('district') || b.districtId === p.get('district')) &&
      (!p.get('taluka') || b.talukaId === p.get('taluka')) &&
      (!p.get('village') || b.villageId === p.get('village')) &&
      (!types.length || types.includes(s.benefitType)) &&
      (!genders.length || genders.includes(b.gender)) &&
      // Only disclosed names are searchable, in either script (English or Marathi).
      (!name ||
        (s.disclosure.nameApproved &&
          (b.name.toLowerCase().includes(name) || localize(b.name, 'mr').includes(name))))
    );
  });
}

function groupBy(records: MockBeneficiary[], key: (b: MockBeneficiary) => string): LabelledMetric[] {
  const groups = new Map<string, LabelledMetric>();
  for (const b of records) {
    const label = key(b);
    const g = groups.get(label) ?? { label, beneficiaries: 0, amount: 0 };
    g.beneficiaries++;
    g.amount += b.amount;
    groups.set(label, g);
  }
  return [...groups.values()].sort((a, b) => b.beneficiaries - a.beneficiaries);
}

function dashboard(p: HttpParams, lang: MockLang): DashboardSummary {
  const records = filterRecords(p);
  return {
    totalBeneficiaries: records.length,
    totalAmount: records.reduce((sum, b) => sum + b.amount, 0),
    activeSchemes: new Set(records.map((b) => b.schemeId)).size,
    districtsCovered: new Set(records.map((b) => b.districtId)).size,
    byScheme: groupBy(records, (b) => localize(schemeOf(b).label, lang)),
    byDistrict: groupBy(records, (b) => labelOf(DISTRICTS, b.districtId, lang)),
    byGender: groupBy(records, (b) => labelOf(GENDERS, b.gender, lang))
  };
}

function directory(p: HttpParams, lang: MockLang): SchemeDirectoryRow[] {
  const records = filterRecords(p);
  const depts = list(p, 'dept');
  const types = list(p, 'benefitType');
  return SCHEMES.filter(
    (s) => (!depts.length || depts.includes(s.departmentId)) && (!types.length || types.includes(s.benefitType)) && (!p.get('scheme') || s.value === p.get('scheme'))
  ).map((s) => {
    const rows = records.filter((b) => b.schemeId === s.value);
    return {
      id: s.value,
      scheme: localize(s.label, lang),
      department: labelOf(DEPARTMENTS, s.departmentId, lang),
      benefitType: labelOf(BENEFIT_TYPES, s.benefitType, lang),
      beneficiaries: rows.length,
      amount: rows.reduce((sum, b) => sum + b.amount, 0),
      status: s.status // enum; the UI translates it
    };
  });
}

function beneficiaries(p: HttpParams, lang: MockLang): Page<BeneficiaryApiRecord> {
  const records = filterRecords(p);
  const page = Number(p.get('page') ?? 0);
  const size = Math.min(Number(p.get('size') ?? 10), 50); // server-side cap: no bulk extraction
  return {
    total: records.length,
    items: records.slice(page * size, page * size + size).map((b) => {
      const s = schemeOf(b);
      const name = localize(b.name, lang);
      return {
        beneficiaryId: maskId(b.id),
        name: s.disclosure.nameApproved ? name : maskName(name),
        schemeName: localize(s.label, lang),
        financialYear: b.fy,
        district: labelOf(DISTRICTS, b.districtId, lang),
        taluka: labelOf(TALUKAS, b.talukaId, lang),
        village: labelOf(VILLAGES, b.villageId, lang),
        benefitAmount: s.disclosure.amountApproved ? b.amount : null,
        benefitPeriod: b.period,
        disclosure: s.disclosure
      };
    })
  };
}
