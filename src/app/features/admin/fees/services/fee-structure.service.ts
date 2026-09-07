import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiService } from '../../../../core/services/api.service';
import { API_ENDPOINTS } from '../../../../core/constants/api-endpoints';

import {
  FeeStructure,
  CreateFeeStructureRequest,
  UpdateFeeStructureRequest,
  UpdateFeeStructureStatusRequest,
  ApiResponse
} from '../models/fee-structure.model';

@Injectable({
  providedIn: 'root'
})
export class FeeStructureService {

  private readonly api = inject(ApiService);

  // =========================
  // GET ALL FEE STRUCTURES
  // =========================

getAll(
  academicYearId?: number
): Observable<FeeStructure[]> {
    let params = new HttpParams();

    if (academicYearId !== undefined) {
      params = params.set(
        'academicYearId',
        academicYearId
      );
    }

   return this.api.get<FeeStructure[]>(
      API_ENDPOINTS.FEE_STRUCTURES.BASE,
      params
    );
  }

  // =========================
  // GET BY ID
  // =========================

  getById(
    id: number
  ): Observable<ApiResponse<FeeStructure>> {

    return this.api.get<ApiResponse<FeeStructure>>(
      API_ENDPOINTS.FEE_STRUCTURES.BY_ID(id)
    );
  }

  // =========================
  // CREATE
  // =========================

  create(
    request: CreateFeeStructureRequest
  ): Observable<ApiResponse<FeeStructure>> {

    return this.api.post<ApiResponse<FeeStructure>>(
      API_ENDPOINTS.FEE_STRUCTURES.BASE,
      request
    );
  }

  // =========================
  // UPDATE
  // =========================

  update(
    id: number,
    request: UpdateFeeStructureRequest
  ): Observable<ApiResponse<FeeStructure>> {

    return this.api.put<ApiResponse<FeeStructure>>(
      API_ENDPOINTS.FEE_STRUCTURES.BY_ID(id),
      request
    );
  }

  // =========================
  // UPDATE STATUS
  // =========================

  updateStatus(
    id: number,
    request: UpdateFeeStructureStatusRequest
  ): Observable<ApiResponse<void>> {

    return this.api.patch<ApiResponse<void>>(
      API_ENDPOINTS.FEE_STRUCTURES.STATUS(id),
      request
    );
  }
}