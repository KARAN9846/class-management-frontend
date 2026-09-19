import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router
} from '@angular/router';
import { catchError, map, of } from 'rxjs';

import { PermissionService } from '../auth/permission.service';

export const permissionGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot
) => {

  const permissionService =
    inject(PermissionService);

  const router =
    inject(Router);

  const requiredPermissions =
    (route.data['permissions'] ?? []) as string[];

  // ---------------------------------------------------------
  // NO PERMISSION REQUIREMENT
  // ---------------------------------------------------------

  if (requiredPermissions.length === 0) {
    return true;
  }

  // ---------------------------------------------------------
  // LOAD CURRENT USER PERMISSIONS
  // ---------------------------------------------------------

  return permissionService
    .loadMyPermissions()
    .pipe(

      map(() => {

        const hasPermission =
          permissionService.hasAllPermissions(
            requiredPermissions
          );

        if (hasPermission) {
          return true;
        }

        return router.createUrlTree([
          '/access-denied'
        ]);
      }),

      catchError(() => {

        return of(
          router.createUrlTree([
            '/access-denied'
          ])
        );

      })

    );
};