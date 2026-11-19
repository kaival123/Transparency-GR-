import { Routes } from '@angular/router';

/** Route titles are translation keys, resolved by I18nTitleStrategy. */
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/shell/shell.component').then((m) => m.ShellComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        title: 'nav.dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.page').then((m) => m.DashboardPage)
      },
      {
        path: 'directory',
        title: 'nav.directory',
        loadComponent: () => import('./features/directory/directory.page').then((m) => m.DirectoryPage)
      },
      {
        path: 'beneficiaries',
        title: 'nav.beneficiaries',
        loadComponent: () => import('./features/beneficiaries/beneficiaries.page').then((m) => m.BeneficiariesPage)
      },
      { path: '**', redirectTo: 'dashboard' }
    ]
  }
];
