import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';

import { ApiService } from './api.service';
import {
  AbsentStudentNotification,
  NotificationApiResponse,
  PendingAttendanceApiResponse,
  PendingLeaveApiResponse
} from '../models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private readonly api = inject(ApiService);

  /**
   * Get today's absent students for the logged-in admin.
   */
  getTodayAbsentStudents():
    Observable<NotificationApiResponse> {

    return this.api.get<NotificationApiResponse>(
      '/attendance/notifications/absent-today'
    );
  }

  /**
 * Get class sections where today's attendance is incomplete.
 */
getPendingAttendance(): Observable<PendingAttendanceApiResponse> {
  return this.api.get<PendingAttendanceApiResponse>(
    '/attendance/notifications/pending'
  );
}

  getPendingLeaveRequests(): Observable<PendingLeaveApiResponse> {
    const params = new HttpParams().set('page', 0).set('size', 10);
    return this.api.get<PendingLeaveApiResponse>('/leave-requests/admin/pending', params);
  }
}
