import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { ApiService } from '../../../core/services/api.service';
import { ApiResponse, AcademicYearPage, LeaveApplicantReport, LeaveRequest, LeaveRequestFilters, LeaveRequestPage, LeaveRequestPayload, LeaveSummary } from '../models/leave.model';

@Injectable({ providedIn: 'root' })
export class LeaveService {
  private readonly api = inject(ApiService);

  list(page = 0, size = 10, filters: LeaveRequestFilters = {}): Observable<ApiResponse<LeaveRequestPage>> {
    const params = this.params(page, size, filters);
    return this.api.get<ApiResponse<LeaveRequestPage>>('/leave-requests/my', params);
  }
  get(id: number): Observable<ApiResponse<LeaveRequest>> { return this.api.get<ApiResponse<LeaveRequest>>(`/leave-requests/my/${id}`); }
  submit(payload: LeaveRequestPayload): Observable<ApiResponse<LeaveRequest>> { return this.api.post<ApiResponse<LeaveRequest>>('/leave-requests', payload); }
  cancel(id: number): Observable<ApiResponse<LeaveRequest>> { return this.api.post<ApiResponse<LeaveRequest>>(`/leave-requests/${id}/cancel`, {}); }
  myAcademicYears(page = 0, size = 50): Observable<ApiResponse<AcademicYearPage>> {
    const params = new HttpParams().set('page', page).set('size', size).set('sort', 'createdAt,desc');
    return this.api.get<ApiResponse<AcademicYearPage>>('/leave-requests/my/academic-years', params);
  }
  mySummary(academicYearId: number): Observable<ApiResponse<LeaveSummary>> {
    return this.api.get<ApiResponse<LeaveSummary>>('/leave-requests/my/summary', new HttpParams().set('academicYearId', academicYearId));
  }
  adminList(page = 0, size = 10, filters: LeaveRequestFilters = {}): Observable<ApiResponse<LeaveRequestPage>> { return this.api.get<ApiResponse<LeaveRequestPage>>('/leave-requests/admin', this.params(page, size, filters)); }
  adminGet(id: number): Observable<ApiResponse<LeaveRequest>> { return this.api.get<ApiResponse<LeaveRequest>>(`/leave-requests/admin/${id}`); }
  teacherList(page = 0, size = 10, filters: LeaveRequestFilters = {}): Observable<ApiResponse<LeaveRequestPage>> { return this.api.get<ApiResponse<LeaveRequestPage>>('/leave-requests/teacher', this.params(page, size, filters)); }
  teacherGet(id: number): Observable<ApiResponse<LeaveRequest>> { return this.api.get<ApiResponse<LeaveRequest>>(`/leave-requests/teacher/${id}`); }
  adminSummary(academicYearId?: number): Observable<ApiResponse<LeaveSummary>> {
    const params = academicYearId === undefined ? undefined : new HttpParams().set('academicYearId', academicYearId);
    return this.api.get<ApiResponse<LeaveSummary>>('/leave-requests/admin/summary', params);
  }
  studentAnnualReport(studentId: number, academicYearId: number, page = 0, size = 10): Observable<ApiResponse<LeaveApplicantReport>> {
    return this.applicantReport('students', studentId, academicYearId, page, size);
  }
  teacherAnnualReport(teacherId: number, academicYearId: number, page = 0, size = 10): Observable<ApiResponse<LeaveApplicantReport>> {
    return this.applicantReport('teachers', teacherId, academicYearId, page, size);
  }
  approve(id: number, body: { comment: string }): Observable<ApiResponse<LeaveRequest>> { return this.api.post<ApiResponse<LeaveRequest>>(`/leave-requests/admin/${id}/approve`, body); }
  reject(id: number, body: { comment: string }): Observable<ApiResponse<LeaveRequest>> { return this.api.post<ApiResponse<LeaveRequest>>(`/leave-requests/admin/${id}/reject`, body); }
  teacherApprove(id: number, body: { comment?: string }): Observable<ApiResponse<LeaveRequest>> { return this.api.post<ApiResponse<LeaveRequest>>(`/leave-requests/teacher/${id}/approve`, body); }
  teacherReject(id: number, body: { comment: string }): Observable<ApiResponse<LeaveRequest>> { return this.api.post<ApiResponse<LeaveRequest>>(`/leave-requests/teacher/${id}/reject`, body); }
  private applicantReport(type: 'students' | 'teachers', id: number, academicYearId: number, page: number, size: number): Observable<ApiResponse<LeaveApplicantReport>> {
    const params = new HttpParams().set('academicYearId', academicYearId).set('page', page).set('size', size);
    return this.api.get<ApiResponse<LeaveApplicantReport>>(`/leave-requests/admin/reports/${type}/${id}`, params);
  }
  private params(page: number, size: number, filters: LeaveRequestFilters): HttpParams {
    let params = new HttpParams().set('page', page).set('size', size);
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null && value !== '') params = params.set(key, String(value));
    }
    return params;
  }
}
