import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '../../../../core/services/api.service';
import { Attendance } from '../../../admin/attendance/models/attendance.model';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class StudentAttendance {

  private readonly api = inject(ApiService);

  getMyAttendance(): Observable<ApiResponse<Attendance[]>> {
    return this.api.get<ApiResponse<Attendance[]>>(
      '/attendance/my'
    );
  }
}