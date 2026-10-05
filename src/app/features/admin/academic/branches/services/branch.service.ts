import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '../../../../../core/services/api.service';
import {
  Branch,
  CreateBranchRequest,
  PageResponse,
  UpdateBranchRequest,
} from '../branch.model';

@Injectable({
  providedIn: 'root',
})
export class BranchService {
  private readonly apiService = inject(ApiService);
  private readonly endpoint = '/branches';

  getAll(
    page = 0,
    size = 50,
    sort = 'name,asc'
  ): Observable<PageResponse<Branch>> {
    return this.apiService.get<PageResponse<Branch>>(
      `${this.endpoint}?page=${page}&size=${size}&sort=${sort}`
    );
  }

  getById(id: number): Observable<Branch> {
    return this.apiService.get<Branch>(`${this.endpoint}/${id}`);
  }

  create(request: CreateBranchRequest): Observable<Branch> {
    return this.apiService.post<Branch>(this.endpoint, request);
  }

  update(id: number, request: UpdateBranchRequest): Observable<Branch> {
    return this.apiService.put<Branch>(`${this.endpoint}/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${id}`);
  }
}
