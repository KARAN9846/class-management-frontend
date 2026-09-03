import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '../../../../core/services/api.service';
import { Attendance } from '../models/attendance.model';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {

  private readonly api = inject(ApiService);

  getAttendance(): Observable<ApiResponse<Attendance[]>> {
    return this.api.get<ApiResponse<Attendance[]>>(
      '/attendance'
    );
  }

  getAttendanceByStudent(
    studentId: number
  ): Observable<ApiResponse<Attendance[]>> {
    return this.api.get<ApiResponse<Attendance[]>>(
      `/attendance/student/${studentId}`
    );
  }
}