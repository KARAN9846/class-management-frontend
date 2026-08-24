import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '../../../../../core/services/api.service';

import {
  AcademicYear,
  CreateAcademicYearRequest,
  UpdateAcademicYearRequest
} from '../academic-year.model';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Injectable({
  providedIn: 'root'
})
export class AcademicYearService {

  private readonly api = inject(ApiService);

  private readonly endpoint = '/academic-years';

  getAll(): Observable<ApiResponse<PageResponse<AcademicYear>>> {

    return this.api.get<ApiResponse<PageResponse<AcademicYear>>>(
      `${this.endpoint}?page=0&size=10&sort=createdAt,desc`
    );
  }

  getById(
    id: number
  ): Observable<ApiResponse<AcademicYear>> {

    return this.api.get<ApiResponse<AcademicYear>>(
      `${this.endpoint}/${id}`
    );
  }

  create(
    request: CreateAcademicYearRequest
  ): Observable<ApiResponse<AcademicYear>> {

    return this.api.post<ApiResponse<AcademicYear>>(
      this.endpoint,
      request
    );
  }

  update(
    id: number,
    request: UpdateAcademicYearRequest
  ): Observable<ApiResponse<AcademicYear>> {

    return this.api.put<ApiResponse<AcademicYear>>(
      `${this.endpoint}/${id}`,
      request
    );
  }

  setCurrent(
    id: number
  ): Observable<ApiResponse<AcademicYear>> {

    return this.api.patch<ApiResponse<AcademicYear>>(
      `${this.endpoint}/${id}/current`
    );
  }

  delete(
    id: number
  ): Observable<ApiResponse<void>> {

    return this.api.delete<ApiResponse<void>>(
      `${this.endpoint}/${id}`
    );
  }
}
