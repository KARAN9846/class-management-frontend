import {
  HttpErrorResponse,
  HttpInterceptorFn
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';

import { TokenService } from '../auth/token.service';
import { AuthService } from '../auth/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const tokenService = inject(TokenService);
  const authService = inject(AuthService);

  const token = tokenService.getToken();

  // No access token → send request normally
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

      // Only handle expired/invalid authentication
      if (error.status !== 401) {
        return throwError(() => error);
      }

      const refreshToken = tokenService.getRefreshToken();

      // No refresh token → user must login again
      if (!refreshToken) {
        tokenService.removeAllTokens();
        return throwError(() => error);
      }

      return authService.refresh(refreshToken).pipe(

        switchMap(response => {

          const newAccessToken = response.data?.accessToken;

          if (!newAccessToken) {
            tokenService.removeAllTokens();
            return throwError(() => error);
          }

          // Store new access token
          tokenService.setToken(newAccessToken);

          // Backend currently returns the same refresh token.
          // Keep it if one is returned.
          if (response.data?.refreshToken) {
            tokenService.setRefreshToken(
              response.data.refreshToken
            );
          }

          // Retry original request with new access token
          const retryReq = req.clone({
            setHeaders: {
              Authorization: `Bearer ${newAccessToken}`
            }
          });

          return next(retryReq);
        }),

        catchError(refreshError => {
          // Refresh failed → session is no longer valid
          tokenService.removeAllTokens();

          return throwError(() => refreshError);
        })
      );
    })
  );
};