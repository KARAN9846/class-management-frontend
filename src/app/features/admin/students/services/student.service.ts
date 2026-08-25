import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';

import { ApiService } from '../../../../core/services/api.service';

import {
  Student,
  StudentDetails,
  CreateStudentRequest,
  UpdateStudentRequest
} from '../models/student.model';

export interface StudentPage {
  content: Student[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class StudentService {

  private readonly api = inject(ApiService);

  // =========================
  // GET STUDENTS
  // =========================

  getStudents(
    page = 0,
    size = 10,
    search = ''
  ): Observable<ApiResponse<StudentPage>> {

    const params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('search', search)
      .set('sortBy', 'firstName')
      .set('sortDirection', 'asc');

    return this.api.get<ApiResponse<StudentPage>>(
      '/students',
      params
    );
  }


  // =========================
  // GET STUDENT BY ID
  // =========================

  getStudentById(
    id: number
  ): Observable<ApiResponse<StudentDetails>> {

    return this.api.get<ApiResponse<StudentDetails>>(
      `/students/${id}`
    );
  }


  // =========================
  // CREATE STUDENT
  // =========================

  createStudent(
    request: CreateStudentRequest
  ): Observable<ApiResponse<StudentDetails>> {

    return this.api.post<ApiResponse<StudentDetails>>(
      '/students',
      request
    );
  }


  // =========================
  // UPDATE STUDENT
  // =========================

  updateStudent(
    id: number,
    request: UpdateStudentRequest
  ): Observable<ApiResponse<StudentDetails>> {

    return this.api.put<ApiResponse<StudentDetails>>(
      `/students/${id}`,
      request
    );
  }


  // =========================
  // UPDATE STATUS
  // =========================

  updateStatus(
    id: number,
    isActive: boolean
  ): Observable<ApiResponse<void>> {

    return this.api.patch<ApiResponse<void>>(
      `/students/${id}/status`,
      {
        isActive
      }
    );
  }

    // =========================
  // DELETE STUDENT
  // =========================

  deleteStudent(
    id: number
  ): Observable<ApiResponse<void>> {

    return this.api.delete<ApiResponse<void>>(
      `/students/${id}`
    );
  }

}