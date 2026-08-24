import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../core/services/api.service';

export interface Subject {
  id: number;
  name: string;
  code: string;
  classId: number;
  className: string;
  academicYear: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubjectRequest {
  name: string;
  code: string;
  classId: number;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: unknown;
}

@Injectable({
  providedIn: 'root'
})
export class SubjectService {

  private readonly apiService = inject(ApiService);

  getSubjects(): Observable<ApiResponse<Subject[]>> {
    return this.apiService.get<ApiResponse<Subject[]>>('/subjects');
  }

  createSubject(
    request: SubjectRequest
  ): Observable<ApiResponse<Subject>> {
    return this.apiService.post<ApiResponse<Subject>>(
      '/subjects',
      request
    );
  }

  updateSubject(
    id: number,
    request: SubjectRequest
  ): Observable<ApiResponse<Subject>> {
    return this.apiService.put<ApiResponse<Subject>>(
      `/subjects/${id}`,
      request
    );
  }

  deleteSubject(
    id: number
  ): Observable<ApiResponse<void>> {
    return this.apiService.delete<ApiResponse<void>>(
      `/subjects/${id}`
    );
  }
}
