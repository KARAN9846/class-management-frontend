import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiService } from '../../../../core/services/api.service';

import {
  TeacherStudent,
  TeacherStudentPage,
  ApiResponse,
  TeacherStudentQuery,
  TeacherStudentScopeOption,
  CreateStudentRequest,
  UpdateStudentRequest
} from '../models/teacher-student.model';

@Injectable({
  providedIn: 'root'
})
export class TeacherStudentService {

  private readonly api = inject(ApiService);

  // =========================================================
  // GET STUDENTS
  // =========================================================

  getStudents(
    query?: TeacherStudentQuery
  ): Observable<ApiResponse<TeacherStudentPage>> {

    let params = new HttpParams();

    if (query?.page !== undefined) {
      params = params.set(
        'page',
        query.page.toString()
      );
    }

    if (query?.size !== undefined) {
      params = params.set(
        'size',
        query.size.toString()
      );
    }

    if (query?.search?.trim()) {
      params = params.set(
        'search',
        query.search.trim()
      );
    }

    if (query?.sortBy?.trim()) {
      params = params.set(
        'sortBy',
        query.sortBy.trim()
      );
    }

    if (query?.sortDirection) {
      params = params.set(
        'sortDirection',
        query.sortDirection
      );
    }

    return this.api.get<ApiResponse<TeacherStudentPage>>(
      '/teacher/students',
      params
    );
  }

  // =========================================================
  // GET STUDENT BY ID
  // =========================================================

  getStudentById(
    studentId: number
  ): Observable<ApiResponse<TeacherStudent>> {

    return this.api.get<ApiResponse<TeacherStudent>>(
      `/teacher/students/${studentId}`
    );
  }

  // =========================================================
  // GET SCOPE OPTIONS
  // =========================================================

  getScopeOptions(): Observable<
    ApiResponse<TeacherStudentScopeOption[]>
  > {

    return this.api.get<
      ApiResponse<TeacherStudentScopeOption[]>
    >(
      '/teacher/students/options'
    );
  }

  // =========================================================
  // CREATE STUDENT
  // =========================================================

  createStudent(
    request: CreateStudentRequest
  ): Observable<ApiResponse<TeacherStudent>> {

    return this.api.post<
      ApiResponse<TeacherStudent>
    >(
      '/teacher/students',
      request
    );
  }

  // =========================================================
  // UPDATE STUDENT
  // =========================================================

  updateStudent(
    studentId: number,
    request: UpdateStudentRequest
  ): Observable<ApiResponse<TeacherStudent>> {

    return this.api.put<
      ApiResponse<TeacherStudent>
    >(
      `/teacher/students/${studentId}`,
      request
    );
  }

  // =========================================================
  // UPDATE STUDENT STATUS
  // =========================================================

  updateStudentStatus(
    studentId: number,
    isActive: boolean
  ): Observable<ApiResponse<void>> {

    const params = new HttpParams()
      .set('isActive', isActive.toString());

    const queryString = params.toString();

    return this.api.patch<
      ApiResponse<void>
    >(
      `/teacher/students/${studentId}/status?${queryString}`,
      null
    );
  }

  // =========================================================
  // DELETE STUDENT
  // =========================================================

  deleteStudent(
    studentId: number
  ): Observable<ApiResponse<void>> {

    return this.api.delete<
      ApiResponse<void>
    >(
      `/teacher/students/${studentId}`
    );
  }
}