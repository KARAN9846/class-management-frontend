import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '../../../../core/services/api.service';

import {
  Assignment,
  AssignmentRequest
} from '../models/assignment.model';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: unknown;
}

@Injectable({
  providedIn: 'root'
})
export class AssignmentService {

  private readonly apiService =
    inject(ApiService);


  // =========================
  // GET ALL
  // =========================

  getAssignments():
    Observable<ApiResponse<Assignment[]>> {

    return this.apiService.get<
      ApiResponse<Assignment[]>
    >('/assignments');

  }


  // =========================
  // GET BY ID
  // =========================

  getAssignment(
    id: number
  ): Observable<ApiResponse<Assignment>> {

    return this.apiService.get<
      ApiResponse<Assignment>
    >(`/assignments/${id}`);

  }


  // =========================
  // CREATE
  // =========================

  createAssignment(
    request: AssignmentRequest
  ): Observable<ApiResponse<Assignment>> {

    return this.apiService.post<
      ApiResponse<Assignment>
    >(
      '/assignments',
      request
    );

  }


  // =========================
  // UPDATE
  // =========================

  updateAssignment(
    id: number,
    request: AssignmentRequest
  ): Observable<ApiResponse<Assignment>> {

    return this.apiService.put<
      ApiResponse<Assignment>
    >(
      `/assignments/${id}`,
      request
    );

  }


  // =========================
  // DELETE
  // =========================

  deleteAssignment(
    id: number
  ): Observable<ApiResponse<void>> {

    return this.apiService.delete<
      ApiResponse<void>
    >(
      `/assignments/${id}`
    );

  }

}