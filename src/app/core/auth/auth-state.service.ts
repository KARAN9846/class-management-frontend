import { Injectable } from '@angular/core';
import { TokenService } from './token.service';
import { UserRole } from '../models/user-role.model';

@Injectable({
  providedIn: 'root',
})
export class AuthStateService {

  constructor(
    private readonly tokenService: TokenService
  ) {}

  isAuthenticated(): boolean {
    return this.tokenService.hasToken();
  }

  getRole(): UserRole | null {
    return this.tokenService.getRole() as UserRole | null;
  }

  getEmail(): string | null {
    return this.tokenService.getEmail();
  }

  logout(): void {
    this.tokenService.removeToken();
  }
}