import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { I18nService } from './i18n.service';

/** Asks the API for labels (departments, schemes, places, names) in the selected language. */
export const languageInterceptor: HttpInterceptorFn = (req, next) => {
  const lang = inject(I18nService).lang();
  return next(req.clone({ setHeaders: { 'Accept-Language': lang } }));
};
