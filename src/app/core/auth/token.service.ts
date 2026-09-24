import { Injectable } from '@angular/core';

import { JwtPayload } from '../../features/auth/models/jwt-payload.model';

@Injectable({
  providedIn: 'root',
})
export class TokenService {

  private readonly TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';

  setToken(token: string): void {
    sessionStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return sessionStorage.getItem(this.TOKEN_KEY);
  }

  removeToken(): void {
    sessionStorage.removeItem(this.TOKEN_KEY);
  }

  setRefreshToken(token: string): void {
  sessionStorage.setItem(this.REFRESH_TOKEN_KEY, token);
}

getRefreshToken(): string | null {
  return sessionStorage.getItem(this.REFRESH_TOKEN_KEY);
}

removeRefreshToken(): void {
  sessionStorage.removeItem(this.REFRESH_TOKEN_KEY);
}

removeAllTokens(): void {
  this.removeToken();
  this.removeRefreshToken();
}

  hasToken(): boolean {
    return !!this.getToken() && !this.isTokenExpired();
  }

  getPayload(): JwtPayload | null {

    const token = this.getToken();

    if (!token) {
      return null;
    }

    try {

      const payload = token.split('.')[1];

      return JSON.parse(atob(payload));

    } catch {

      return null;
    }
  }

  getRole(): string | null {
    return this.getPayload()?.role ?? null;
  }

  getEmail(): string | null {
    return this.getPayload()?.sub ?? null;
  }

  isTokenExpired(): boolean {

    const payload = this.getPayload();

    if (!payload?.exp) {
      return true;
    }

    return Date.now() >= payload.exp * 1000;
  }
}