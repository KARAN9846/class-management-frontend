import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '../../../../core/services/api.service';

import {
  TeacherRole,
  CreateTeacherRoleRequest,
  UpdateTeacherRoleRequest
} from '../models/teacher-role.model';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: string[] | null;
}

@Injectable({
  providedIn: 'root'
})
export class TeacherRoleService {

  private readonly api = inject(ApiService);

  private readonly endpoint = '/teacher-roles';

  getRoles(): Observable<ApiResponse<TeacherRole[]>> {
    return this.api.get<ApiResponse<TeacherRole[]>>(
      this.endpoint
    );
  }

  getRoleById(
    id: number
  ): Observable<ApiResponse<TeacherRole>> {
    return this.api.get<ApiResponse<TeacherRole>>(
      `${this.endpoint}/${id}`
    );
  }

  createRole(
    request: CreateTeacherRoleRequest
  ): Observable<ApiResponse<TeacherRole>> {
    return this.api.post<ApiResponse<TeacherRole>>(
      this.endpoint,
      request
    );
  }

  updateRole(
    id: number,
    request: UpdateTeacherRoleRequest
  ): Observable<ApiResponse<TeacherRole>> {
    return this.api.put<ApiResponse<TeacherRole>>(
      `${this.endpoint}/${id}`,
      request
    );
  }

  deactivateRole(
    id: number
  ): Observable<ApiResponse<void>> {
    return this.api.patch<ApiResponse<void>>(
      `${this.endpoint}/${id}/deactivate`
    );
  }

  deleteRole(id: number): Observable<ApiResponse<void>> {

    
  return this.api.delete<ApiResponse<void>>(
    `${this.endpoint}/${id}`
  );
}


}
