import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '../../../../../core/services/api.service';


import {
  PasswordManagementUser,
  PasswordResetResponse
} from '../models/password-management.model';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class PasswordManagementService {

  private readonly api = inject(ApiService);

  getUsers(): Observable<ApiResponse<PasswordManagementUser[]>> {
    return this.api.get<ApiResponse<PasswordManagementUser[]>>(
      '/password-management'
    );
  }

  resetPassword(
    userId: number
  ): Observable<ApiResponse<PasswordResetResponse>> {
    return this.api.post<ApiResponse<PasswordResetResponse>>(
      `/password-management/${userId}/reset`,
      {}
    );
  }
}