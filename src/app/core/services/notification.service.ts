import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from './api.service';
import {
  AbsentStudentNotification,
  NotificationApiResponse
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
}