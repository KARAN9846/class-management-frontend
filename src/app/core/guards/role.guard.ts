import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router
} from '@angular/router';

import { TokenService } from '../auth/token.service';

export const roleGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot
) => {

  const tokenService = inject(TokenService);
  const router = inject(Router);

  // Get logged-in user's role
  const userRole = tokenService.getRole();

  console.log('ROLE GUARD');
  console.log('User Role:', userRole);
  console.log('Requested URL:', route.url.join('/'));

  // No role → access denied
  if (!userRole) {

    console.log('❌ No user role');

    return router.createUrlTree(['/access-denied']);
  }

  // Get roles allowed for this route
  const allowedRoles = route.data['roles'] as string[] | undefined;

  console.log('Allowed Roles:', allowedRoles);

  // Route has no role restriction
  if (!allowedRoles || allowedRoles.length === 0) {

    console.log('✅ No role restriction');

    return true;
  }

  // Check permission
  const hasPermission = allowedRoles.includes(userRole);

  console.log('Has Permission:', hasPermission);

  if (hasPermission) {

    console.log('✅ ACCESS GRANTED');

    return true;
  }

  console.log('❌ ACCESS DENIED');

  return router.createUrlTree(['/access-denied']);
};