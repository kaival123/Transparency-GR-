import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { FilterStateService } from './filter-state.service';

describe('FilterStateService (spec §6)', () => {
  let service: FilterStateService;
  let router: Router;

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([{ path: '**', children: [] }])] });
    service = TestBed.inject(FilterStateService);
    router = TestBed.inject(Router);
    await router.navigateByUrl('/');
  });

  it('applies filters to the right pages', () => {
    const keys = (page: Parameters<FilterStateService['definitionsFor']>[0]) => service.definitionsFor(page).map((d) => d.key);
    expect(keys('dashboard')).toEqual(['fy', 'dept', 'scheme', 'district', 'taluka', 'village']);
    expect(keys('directory')).toEqual(['fy', 'dept', 'scheme', 'district']);
    expect(keys('beneficiaries')).toEqual(['fy', 'dept', 'scheme', 'district', 'taluka', 'village', 'name']);
  });

  it('retains filters in the URL so the view can be shared', async () => {
    service.update({ fy: '2024-25', dept: ['SJSA', 'TDD'] });
    await TestBed.inject(Router).navigated;
    await new Promise((r) => setTimeout(r));
    expect(router.url).toContain('fy=2024-25');
    expect(router.url).toContain('dept=SJSA,TDD');
    expect(service.state().dept).toEqual(['SJSA', 'TDD']);
  });

  it('clears dependent filters when a parent changes', async () => {
    await router.navigateByUrl('/?district=NASHIK&taluka=IGATPU&village=IGATPU-GHOTI&dept=SJSA&scheme=IGNDPS');
    service.update({ district: 'PUNE' });
    await new Promise((r) => setTimeout(r));
    expect(service.state().district).toBe('PUNE');
    expect(service.state().taluka).toBeNull();
    expect(service.state().village).toBeNull();
    service.update({ dept: ['AGRI'] });
    await new Promise((r) => setTimeout(r));
    expect(service.state().scheme).toBeNull();
  });
});
