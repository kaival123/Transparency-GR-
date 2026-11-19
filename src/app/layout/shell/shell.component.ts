import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DrawerModule } from 'primeng/drawer';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { TranslationKey } from '../../core/i18n/en';
import { I18nService } from '../../core/i18n/i18n.service';
import { ThemeService } from '../../core/services/theme.service';
import { HeaderToolsComponent } from '../header-tools/header-tools.component';

interface NavItem {
  label: TranslationKey;
  description: TranslationKey;
  icon: string;
  path: string;
}

@Component({
  selector: 'app-shell',
  imports: [
    NgTemplateOutlet, RouterOutlet, RouterLink, RouterLinkActive, ButtonModule, DrawerModule, ToastModule,
    ConfirmDialogModule, TooltipModule, HeaderToolsComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.css'
})
export class ShellComponent {
  protected readonly theme = inject(ThemeService);
  protected readonly i18n = inject(I18nService);
  protected readonly t = this.i18n.t;
  protected readonly mobileNavOpen = signal(false);

  protected readonly nav: NavItem[] = [
    { label: 'nav.dashboard', description: 'nav.dashboard.desc', icon: 'pi-chart-bar', path: '/dashboard' },
    { label: 'nav.directory', description: 'nav.directory.desc', icon: 'pi-th-large', path: '/directory' },
    { label: 'nav.beneficiaries', description: 'nav.beneficiaries.desc', icon: 'pi-users', path: '/beneficiaries' }
  ];
}
