import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';

import { ApiService } from '../../../../core/services/api.service';
import {
  Attendance,
  AttendancePageQuery,
  AttendancePageResponse
} from '../models/attendance.model';

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

  getAttendancePage(
    query: AttendancePageQuery
  ): Observable<ApiResponse<AttendancePageResponse>> {
    let params = new HttpParams()
      .set('page', query.page)
      .set('size', query.size);

    const optionalParams: Record<string, string | number | undefined> = {
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
      status: query.status,
      academicYearId: query.academicYearId,
      classId: query.classId,
      sectionId: query.sectionId,
      search: query.search,
      sortBy: query.sortBy,
      sortDirection: query.sortDirection
    };

    Object.entries(optionalParams).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params = params.set(key, value);
      }
    });

    return this.api.get<ApiResponse<AttendancePageResponse>>(
      '/attendance/page',
      params
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
