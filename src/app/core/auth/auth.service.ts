import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { LoginRequest } from '../../features/auth/models/login-request.model';
import { LoginResponse } from '../../features/auth/models/login-response.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private readonly authUrl =
    `${environment.apiBaseUrl}/auth`;

  constructor(
    private readonly http: HttpClient
  ) {}

login(request: LoginRequest): Observable<LoginResponse> {
  return this.http.post<LoginResponse>(
    `${this.authUrl}/login`,
    request
  );
}

logout(): Observable<void> {
  return this.http.post<void>(
    `${this.authUrl}/logout`,
    {}
  );
}
}