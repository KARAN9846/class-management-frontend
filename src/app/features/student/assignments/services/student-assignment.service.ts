import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '../../../../core/services/api.service';

import { Assignment } from '../../../admin/assignments/models/assignment.model';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: unknown;
}

@Injectable({
  providedIn: 'root'
})
export class StudentAssignmentService {

  private readonly apiService =
    inject(ApiService);


  // =========================================================
  // GET MY ASSIGNMENTS
  // =========================================================

  getMyAssignments():
    Observable<ApiResponse<Assignment[]>> {

    return this.apiService.get<
      ApiResponse<Assignment[]>
    >('/student/assignments');

  }

}