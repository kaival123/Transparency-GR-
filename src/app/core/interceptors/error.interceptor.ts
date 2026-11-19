import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { catchError, throwError } from 'rxjs';
import { I18nService } from '../i18n/i18n.service';

/** Shows a toast for failed API calls; pages still render their own error state with a retry. */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const messages = inject(MessageService);
  const { t } = inject(I18nService);
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      messages.add({
        severity: 'error',
        summary: t('api.errorSummary'),
        detail: error.status === 0 ? t('api.unreachable') : t('api.failed', { status: String(error.status) }),
        key: 'global'
      });
      return throwError(() => error);
    })
  );
};
