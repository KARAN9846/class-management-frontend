import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '../../../../core/services/api.service';

import {
  TeacherAssignment,
  TeacherAssignmentRequest
} from '../models/teacher-assignment.model';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: unknown;
}

@Injectable({
  providedIn: 'root'
})
export class TeacherAssignmentService {

  private readonly api =
    inject(ApiService);

  private readonly endpoint =
    '/teacher-assignments';


  // =========================================================
  // GET ALL
  // =========================================================

  getAll():
    Observable<ApiResponse<TeacherAssignment[]>> {

    return this.api.get<
      ApiResponse<TeacherAssignment[]>
    >(this.endpoint);
  }


  // =========================================================
  // GET BY ID
  // =========================================================

  getById(
    id: number
  ):
    Observable<ApiResponse<TeacherAssignment>> {

    return this.api.get<
      ApiResponse<TeacherAssignment>
    >(`${this.endpoint}/${id}`);
  }


  // =========================================================
  // CREATE
  // =========================================================

  create(
    request: TeacherAssignmentRequest
  ):
    Observable<ApiResponse<TeacherAssignment>> {

    return this.api.post<
      ApiResponse<TeacherAssignment>
    >(
      this.endpoint,
      request
    );
  }


  // =========================================================
  // UPDATE
  // =========================================================

  update(
    id: number,
    request: TeacherAssignmentRequest
  ):
    Observable<ApiResponse<TeacherAssignment>> {

    return this.api.put<
      ApiResponse<TeacherAssignment>
    >(
      `${this.endpoint}/${id}`,
      request
    );
  }


  // =========================================================
  // DELETE
  // =========================================================

  delete(
    id: number
  ):
    Observable<ApiResponse<void>> {

    return this.api.delete<
      ApiResponse<void>
    >(
      `${this.endpoint}/${id}`
    );
  }

}