import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { I18nService } from './core/i18n/i18n.service';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<router-outlet />'
})
export class AppComponent {
  // Instantiated at startup so the saved light/dark preference is applied before first paint of pages.
  private readonly theme = inject(ThemeService);
  // Applies the detected language (html lang, PrimeNG strings) before pages render.
  private readonly i18n = inject(I18nService);
}
