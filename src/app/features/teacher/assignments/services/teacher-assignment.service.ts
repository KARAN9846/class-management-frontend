import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '../../../../core/services/api.service';

import {
  Assignment,
  AssignmentRequest
} from '../../../admin/assignments/models/assignment.model';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: unknown;
}

@Injectable({
  providedIn: 'root'
})
export class TeacherAssignmentService {

  private readonly apiService =
    inject(ApiService);


  // =========================================================
  // GET MY ASSIGNMENTS
  // =========================================================

  getMyAssignments():
    Observable<ApiResponse<Assignment[]>> {

    return this.apiService.get<
      ApiResponse<Assignment[]>
    >('/teacher-assignments/my');

  }


  // =========================================================
  // GET MY ASSIGNMENT BY ID
  // =========================================================

  getMyAssignment(
    id: number
  ): Observable<ApiResponse<Assignment>> {

    return this.apiService.get<
      ApiResponse<Assignment>
    >(`/teacher-assignments/my/${id}`);

  }


  // =========================================================
  // UPDATE MY ASSIGNMENT
  // =========================================================

  updateMyAssignment(
    id: number,
    request: AssignmentRequest
  ): Observable<ApiResponse<Assignment>> {

    return this.apiService.put<
      ApiResponse<Assignment>
    >(
      `/teacher-assignments/my/${id}`,
      request
    );

  }


  // =========================================================
  // DELETE MY ASSIGNMENT
  // =========================================================

  deleteMyAssignment(
    id: number
  ): Observable<ApiResponse<void>> {

    return this.apiService.delete<
      ApiResponse<void>
    >(
      `/teacher-assignments/my/${id}`
    );

  }

}