import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '../../../../core/services/api.service';

import {
  TeacherRoleAssignment,
  CreateTeacherRoleAssignmentRequest
} from '../models/teacher-role-assignment.model';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: string[] | null;
}

@Injectable({
  providedIn: 'root'
})
export class TeacherRoleAssignmentService {

  private readonly api = inject(ApiService);

  private readonly endpoint = '/teacher-role-assignments';

  assignRole(
    request: CreateTeacherRoleAssignmentRequest
  ): Observable<ApiResponse<TeacherRoleAssignment>> {

    return this.api.post<ApiResponse<TeacherRoleAssignment>>(
      this.endpoint,
      request
    );
  }

  getAllAssignments(): Observable<ApiResponse<TeacherRoleAssignment[]>> {

    return this.api.get<ApiResponse<TeacherRoleAssignment[]>>(
      this.endpoint
    );
  }

  getAssignmentByTeacherId(
    teacherId: number
  ): Observable<ApiResponse<TeacherRoleAssignment>> {

    return this.api.get<ApiResponse<TeacherRoleAssignment>>(
      `${this.endpoint}/teacher/${teacherId}`
    );
  }

  removeAssignment(
    teacherId: number
  ): Observable<ApiResponse<void>> {

    return this.api.delete<ApiResponse<void>>(
      `${this.endpoint}/teacher/${teacherId}`
    );
  }

  updateAssignment(
    teacherId: number,
    request: CreateTeacherRoleAssignmentRequest
  ): Observable<ApiResponse<TeacherRoleAssignment>> {

    return this.api.put<ApiResponse<TeacherRoleAssignment>>(
      `${this.endpoint}/teacher/${teacherId}`,
      request
    );
  }
}
