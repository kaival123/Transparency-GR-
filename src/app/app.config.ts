import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { TitleStrategy, provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';
import { routes } from './app.routes';
import { I18nTitleStrategy } from './core/i18n/i18n-title.strategy';
import { languageInterceptor } from './core/i18n/language.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { mockApiInterceptor } from './core/mock/mock-api.interceptor';
import { DARK_MODE_CLASS } from './core/services/theme.service';
import { AppPreset } from './themes/app-preset';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding(), withInMemoryScrolling({ scrollPositionRestoration: 'top' })),
    { provide: TitleStrategy, useClass: I18nTitleStrategy },
    // languageInterceptor tags every request; errorInterceptor also sees failures from the mock backend.
    provideHttpClient(withInterceptors([languageInterceptor, errorInterceptor, mockApiInterceptor])),
    providePrimeNG({
      ripple: false,
      theme: {
        preset: AppPreset,
        options: { darkModeSelector: `.${DARK_MODE_CLASS}`, cssLayer: false }
      }
    }),
    MessageService,
    ConfirmationService
  ]
};
