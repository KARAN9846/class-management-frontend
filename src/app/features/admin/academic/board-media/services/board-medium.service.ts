
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '../../../../../core/services/api.service';
import {
  BoardMedium,
  BoardMediumPageResponse,
  CreateBoardMediumRequest,
  UpdateBoardMediumRequest,
} from '../board-medium.model';

@Injectable({
  providedIn: 'root',
})
export class BoardMediumService {
  private readonly api = inject(ApiService);
  private readonly endpoint = '/board-media';

  getAll(
    page = 0,
    size = 50,
    sort = 'name,asc',
  ): Observable<BoardMediumPageResponse> {
    return this.api.get<BoardMediumPageResponse>(
      `${this.endpoint}?page=${page}&size=${size}&sort=${sort}`,
    );
  }

  getById(id: number): Observable<BoardMedium> {
    return this.api.get<BoardMedium>(`${this.endpoint}/${id}`);
  }

  create(request: CreateBoardMediumRequest): Observable<BoardMedium> {
    return this.api.post<BoardMedium>(this.endpoint, request);
  }

  update(
    id: number,
    request: UpdateBoardMediumRequest,
  ): Observable<BoardMedium> {
    return this.api.put<BoardMedium>(`${this.endpoint}/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }
}
