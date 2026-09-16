import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from './api.service';
import { API_ENDPOINTS } from '../constants/api-endpoints';

export interface Profile {
  id: number;

  firstName: string | null;
  lastName: string | null;

  email: string;
  role: string;

  isActive: boolean;

  phone: string | null;

  rollNumber: string | null;
  teacherNumber: string | null;

  enrollmentNumber: string | null;

  academicYear: string | null;
  className: string | null;
  section: string | null;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  private readonly api = inject(ApiService);

  getMyProfile(): Observable<any> {
    return this.api.get(
      API_ENDPOINTS.PROFILE.BASE
    );
  }

  changePassword(
    request: ChangePasswordRequest
  ): Observable<any> {
    return this.api.put(
      API_ENDPOINTS.PROFILE.CHANGE_PASSWORD,
      request
    );
  }
}
