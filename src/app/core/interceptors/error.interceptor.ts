import {
  HttpErrorResponse,
  HttpInterceptorFn
} from '@angular/common/http';

import { inject } from '@angular/core';

import { Router } from '@angular/router';

import {
  catchError,
  throwError
} from 'rxjs';


export const errorInterceptor: HttpInterceptorFn = (
  req,
  next
) => {

  const router = inject(Router);


  return next(req).pipe(

    catchError(
      (error: HttpErrorResponse) => {

        const currentUrl =
          router.url;


        switch (error.status) {

          // =================================================
          // 401 - UNAUTHORIZED
          // =================================================
          //
          // Authentication errors are handled by the
          // authentication interceptor.
          //
          case 401:
            break;


          // =================================================
          // 403 - FORBIDDEN
          // =================================================

          case 403:

            if (
              !currentUrl.startsWith(
                '/access-denied'
              )
            ) {

              void router.navigate([
                '/access-denied'
              ]);

            }

            break;


          // =================================================
          // 404 - NOT FOUND
          // =================================================
          //
          // IMPORTANT:
          //
          // Do NOT automatically navigate to /not-found.
          //
          // An API 404 can be a valid application state.
          //
          // Example:
          //
          // Teacher exists
          //      ↓
          // No role assignment exists
          //      ↓
          // Assignment API returns 404
          //      ↓
          // Component handles it
          //
          case 404:
            break;


          // =================================================
          // SERVER ERRORS
          // =================================================

          case 500:
          case 501:
          case 502:
          case 503:
          case 504:

            if (
              !currentUrl.startsWith(
                '/server-error'
              )
            ) {

              void router.navigate([
                '/server-error'
              ]);

            }

            break;


          // =================================================
          // OTHER APPLICATION ERRORS
          // =================================================
          //
          // 400, 409, 422, etc.
          //
          // Let the calling component/service handle them.
          //

          default:
            break;
        }


        // ===================================================
        // ALWAYS RETHROW
        // ===================================================
        //
        // This allows the original service/component
        // to handle the error appropriately.
        //

        return throwError(
          () => error
        );

      }
    )

  );
};