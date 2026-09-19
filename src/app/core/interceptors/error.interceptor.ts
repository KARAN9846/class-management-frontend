import {
  HttpErrorResponse,
  HttpInterceptorFn
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {

      const currentUrl = router.url;

      switch (error.status) {

        /*
         * Authentication errors are handled by the
         * authentication interceptor.
         */
        case 401:
          break;

        /*
         * Forbidden resource.
         */
        case 403:
          if (!currentUrl.startsWith('/access-denied')) {
            void router.navigate(['/access-denied']);
          }
          break;

        /*
         * Resource not found.
         */
        case 404:
          if (!currentUrl.startsWith('/not-found')) {
            void router.navigate(['/not-found']);
          }
          break;

        /*
         * Server-side failures.
         */
        case 500:
        case 501:
        case 502:
        case 503:
        case 504:
          if (!currentUrl.startsWith('/server-error')) {
            void router.navigate(['/server-error']);
          }
          break;

        /*
         * Application-level errors such as:
         * 400, 409, 422, etc.
         *
         * Let the calling component handle these.
         */
        default:
          break;
      }

      /*
       * Always rethrow the original error so that
       * existing component/service error handling continues
       * to work.
       */
      return throwError(() => error);
    })
  );
};