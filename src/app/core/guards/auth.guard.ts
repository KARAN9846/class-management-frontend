import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { TokenService } from '../auth/token.service';

export const authGuard: CanActivateFn = () => {

  const tokenService = inject(TokenService);
  const router = inject(Router);

  const token = tokenService.getToken();

  console.log('AUTH GUARD');
  console.log('Token exists:', !!token);

  if (token) {

    console.log('✅ AUTHENTICATED');

    return true;
  }

  console.log('❌ NOT AUTHENTICATED');

  return router.createUrlTree(['/login']);
};