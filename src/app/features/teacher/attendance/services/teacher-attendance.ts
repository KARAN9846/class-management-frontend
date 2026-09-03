import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiService } from '../../../../core/services/api.service';

import { Attendance } from '../../../admin/attendance/models/attendance.model';

import {
  MarkAttendanceRequest
} from '../models/attendance-request.model';

import {
  UpdateAttendanceRequest
} from '../models/update-attendance-request.model';

import {
  TeacherAttendanceAssignment
} from '../models/teacher-attendance-assignment.model';

import {
  AttendanceStudent
} from '../models/attendance-student.model';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class TeacherAttendance {

  private readonly api = inject(ApiService);


  // =========================================================
  // GET TEACHER ATTENDANCE
  // =========================================================

  getAttendance(): Observable<ApiResponse<Attendance[]>> {

    return this.api.get<ApiResponse<Attendance[]>>(
      '/attendance/teacher'
    );
  }


  // =========================================================
  // GET MY TEACHER ASSIGNMENTS
  // =========================================================

  getMyTeacherAssignments():
    Observable<ApiResponse<TeacherAttendanceAssignment[]>> {

    return this.api.get<
      ApiResponse<TeacherAttendanceAssignment[]>
    >(
      '/teacher-assignments/my-teacher-assignments'
    );
  }


  // =========================================================
  // GET STUDENTS FOR ATTENDANCE
  // =========================================================

  getAttendanceStudents(
    assignmentId: number
  ): Observable<ApiResponse<AttendanceStudent[]>> {

    const params = new HttpParams()
      .set('assignmentId', assignmentId.toString());

    return this.api.get<
      ApiResponse<AttendanceStudent[]>
    >(
      '/attendance/students',
      params
    );
  }


  // =========================================================
  // MARK ATTENDANCE
  // =========================================================

  markAttendance(
    request: MarkAttendanceRequest
  ): Observable<ApiResponse<Attendance[]>> {

    return this.api.post<ApiResponse<Attendance[]>>(
      '/attendance',
      request
    );
  }

  updateAttendance(
  attendanceId: number,
  request: UpdateAttendanceRequest
): Observable<ApiResponse<Attendance>> {
  return this.api.put<ApiResponse<Attendance>>(
    `/attendance/${attendanceId}`,
    request
  );
}

}