import {
  HttpErrorResponse,
  HttpInterceptorFn
} from '@angular/common/http';
import { inject } from '@angular/core';
import {
  catchError,
  switchMap,
  throwError
} from 'rxjs';

import { TokenService } from '../auth/token.service';
import { AuthService } from '../auth/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const tokenService = inject(TokenService);
  const authService = inject(AuthService);

  /*
   * Never try to refresh the refresh request itself.
   */
  const isRefreshRequest =
    req.url.endsWith('/auth/refresh');

  const token = tokenService.getToken();

  /*
   * No access token → send request normally.
   */
  if (!token) {
    return next(req);
  }

  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  return next(authReq).pipe(

    catchError((error: HttpErrorResponse) => {

      /*
       * Never attempt another refresh for the
       * refresh endpoint itself.
       */
      if (
        error.status !== 401 ||
        isRefreshRequest
      ) {
        return throwError(() => error);
      }

      const refreshToken =
        tokenService.getRefreshToken();

      /*
       * No refresh token → session is invalid.
       */
      if (!refreshToken) {
        tokenService.removeAllTokens();

        return throwError(() => error);
      }

      /*
       * Refresh access token.
       */
      return authService.refresh(refreshToken).pipe(

        switchMap(response => {

          const newAccessToken =
            response.data?.accessToken;

          /*
           * Refresh response did not contain
           * a valid access token.
           */
          if (!newAccessToken) {

            tokenService.removeAllTokens();

            return throwError(() => error);
          }

          /*
           * Store new access token.
           */
          tokenService.setToken(
            newAccessToken
          );

          /*
           * Keep returned refresh token
           * if backend provides one.
           */
          if (response.data?.refreshToken) {

            tokenService.setRefreshToken(
              response.data.refreshToken
            );
          }

          /*
           * Retry original request.
           */
          const retryReq = req.clone({
            setHeaders: {
              Authorization:
                `Bearer ${newAccessToken}`
            }
          });

          return next(retryReq);
        }),

        catchError(refreshError => {

          /*
           * Refresh failed → force login.
           */
          tokenService.removeAllTokens();

          return throwError(
            () => refreshError
          );
        })
      );
    })
  );
};