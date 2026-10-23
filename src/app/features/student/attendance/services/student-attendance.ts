import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiService } from '../../../../core/services/api.service';
import {
  Attendance,
  AttendancePageQuery,
  AttendancePageResponse
} from '../../../admin/attendance/models/attendance.model';
import { AttendanceSummary } from '../models/attendance-summary.model';

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

  getMyAttendancePage(
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
      '/attendance/my/page',
      params
    );
  }

  getMyAttendanceSummary(): Observable<ApiResponse<AttendanceSummary>> {
    return this.api.get<ApiResponse<AttendanceSummary>>(
      '/attendance/my/summary'
    );
  }
}
