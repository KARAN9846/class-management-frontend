import {
  AcademicStructureDashboardData,
  StudentDashboardData,
AssignmentDashboardData,
  TeacherDashboardData,
  AttendanceDashboardData,FinanceDashboardData
} from '../models/dashboard.model';

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '../../../../core/services/api.service';
import { ApiResponse } from '../../fees/models/fee-structure.model';


export interface StudentDashboardResponse {
  success: boolean;
  message: string;
  data: StudentDashboardData;
  errors: unknown;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private readonly apiService = inject(ApiService);

  getTeacherDashboard(): Observable<{
  success: boolean;
  message: string;
  data: TeacherDashboardData;
  errors: unknown;
}> {
  return this.apiService.get<{
    success: boolean;
    message: string;
    data: TeacherDashboardData;
    errors: unknown;
  }>('/dashboard/teachers');
}

  getStudentDashboard(): Observable<StudentDashboardResponse> {
    return this.apiService.get<StudentDashboardResponse>(
      '/dashboard/students'
    );
  }

  getAcademicStructureDashboard(): Observable<{
  success: boolean;
  message: string;
  data: AcademicStructureDashboardData;
  errors: unknown;
}> {
  return this.apiService.get<{
    success: boolean;
    message: string;
    data: AcademicStructureDashboardData;
    errors: unknown;
  }>('/dashboard/academic-structure');
}

getAssignmentDashboard(): Observable<ApiResponse<AssignmentDashboardData>> {
  return this.apiService.get<ApiResponse<AssignmentDashboardData>>(
    '/dashboard/assignments'
  );
}

getAttendanceDashboard(): Observable<ApiResponse<AttendanceDashboardData>> {
  return this.apiService.get<ApiResponse<AttendanceDashboardData>>(
    '/dashboard/attendance'
  );
}


getFinanceDashboard(): Observable<ApiResponse<FinanceDashboardData>> {
  return this.apiService.get<ApiResponse<FinanceDashboardData>>(
    '/dashboard/finance'
  );
}
}