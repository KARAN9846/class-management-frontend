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

export interface StudentImportError {
  rowNumber: number;
  field: string;
  message: string;
}

export interface StudentImportValidationResponse {
  totalRows: number;
  validRows: number;
  errorRows: number;
  errors: StudentImportError[];
}

export interface ImportedStudentCredential {
  firstName: string;
  lastName: string;
  email: string;
  temporaryPassword: string;
}

export interface StudentImportResult {
  importedStudents: number;
  students: ImportedStudentCredential[];
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
  search = '',
  academicYearId?: number,
  classId?: number,
  sectionId?: number
): Observable<ApiResponse<StudentPage>> {

  let params = new HttpParams()
    .set('page', page)
    .set('size', size)
    .set('search', search)
    .set('sortBy', 'firstName')
    .set('sortDirection', 'asc');

  if (academicYearId != null) {
    params = params.set(
      'academicYearId',
      academicYearId
    );
  }

  if (classId != null) {
    params = params.set(
      'classId',
      classId
    );
  }

  if (sectionId != null) {
    params = params.set(
      'sectionId',
      sectionId
    );
  }

  return this.api.get<ApiResponse<StudentPage>>(
    '/students',
    params
  );
}

  // =========================
  // GET STUDENTS FOR EXPORT
  // =========================

  getStudentsForExport(
    search = '',
    academicYearId?: number,
    classId?: number,
    sectionId?: number
  ): Observable<ApiResponse<StudentPage>> {

    return this.getStudents(
      0,
      10000,
      search,
      academicYearId,
      classId,
      sectionId
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

  // =========================
// BULK IMPORT
// =========================

downloadImportTemplate(): Observable<Blob> {
  return this.api.getBlob(
    '/students/import/template'
  );
}

validateImport(
  file: File
): Observable<ApiResponse<StudentImportValidationResponse>> {

  const formData = new FormData();

  formData.append('file', file);

  return this.api.postFormData<
    ApiResponse<StudentImportValidationResponse>
  >(
    '/students/import/validate',
    formData
  );
}

importStudents(
  file: File
): Observable<ApiResponse<StudentImportResult>> {

  const formData = new FormData();

  formData.append('file', file);

  return this.api.postFormData<
    ApiResponse<StudentImportResult>
  >(
    '/students/import',
    formData
  );
}
}