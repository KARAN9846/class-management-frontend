import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiService } from '../../../core/services/api.service';

import {
  AdminExamFilters,
  AdminExamRequest,
  ApiResponse,
  BulkExamMarksRequest,
  Exam,
  ExamListFilters,
  ExamMark,
  PageResponse,
  TeacherExamRequest
} from '../models/exam.model';

@Injectable({
  providedIn: 'root'
})
export class ExamService {
  private readonly api = inject(ApiService);

  private readonly adminEndpoint = '/exams';
  private readonly teacherEndpoint = '/teacher/exams';

  private buildListParams(filters: ExamListFilters): HttpParams {
    let params = new HttpParams()
      .set('page', filters.page ?? 0)
      .set('size', filters.size ?? 20)
      .set('sortBy', filters.sortBy ?? 'examDate')
      .set('sortDirection', filters.sortDirection ?? 'asc');

    if (filters.search?.trim()) {
      params = params.set('search', filters.search.trim());
    }

    if (filters.status) {
      params = params.set('status', filters.status);
    }

    return params;
  }

  // =========================
  // ADMIN EXAMS
  // =========================

  getAdminExams(
    filters: AdminExamFilters = {}
  ): Observable<ApiResponse<PageResponse<Exam>>> {
    let params = this.buildListParams(filters);

    if (filters.academicYearId !== undefined) {
      params = params.set('academicYearId', filters.academicYearId);
    }

    if (filters.classId !== undefined) {
      params = params.set('classId', filters.classId);
    }

    if (filters.sectionId !== undefined) {
      params = params.set('sectionId', filters.sectionId);
    }

    if (filters.subjectId !== undefined) {
      params = params.set('subjectId', filters.subjectId);
    }

    return this.api.get<ApiResponse<PageResponse<Exam>>>(
      this.adminEndpoint,
      params
    );
  }

  getAdminExam(id: number): Observable<ApiResponse<Exam>> {
    return this.api.get<ApiResponse<Exam>>(
      `${this.adminEndpoint}/${id}`
    );
  }

  createAdminExam(
    request: AdminExamRequest
  ): Observable<ApiResponse<Exam>> {
    return this.api.post<ApiResponse<Exam>>(
      this.adminEndpoint,
      request
    );
  }

  updateAdminExam(
    id: number,
    request: AdminExamRequest
  ): Observable<ApiResponse<Exam>> {
    return this.api.put<ApiResponse<Exam>>(
      `${this.adminEndpoint}/${id}`,
      request
    );
  }

  deleteAdminExam(id: number): Observable<ApiResponse<void>> {
    return this.api.delete<ApiResponse<void>>(
      `${this.adminEndpoint}/${id}`
    );
  }

  publishAdminExam(id: number): Observable<ApiResponse<Exam>> {
    return this.api.post<ApiResponse<Exam>>(
      `${this.adminEndpoint}/${id}/publish`,
      {}
    );
  }

  getAdminMarks(
    examId: number,
    page = 0,
    size = 20
  ): Observable<ApiResponse<PageResponse<ExamMark>>> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size);

    return this.api.get<ApiResponse<PageResponse<ExamMark>>>(
      `${this.adminEndpoint}/${examId}/marks`,
      params
    );
  }

  saveAdminMarks(
    examId: number,
    request: BulkExamMarksRequest
  ): Observable<ApiResponse<ExamMark[]>> {
    return this.api.put<ApiResponse<ExamMark[]>>(
      `${this.adminEndpoint}/${examId}/marks`,
      request
    );
  }

  // =========================
  // TEACHER EXAMS
  // =========================

  getTeacherExams(
    filters: ExamListFilters = {}
  ): Observable<ApiResponse<PageResponse<Exam>>> {
    return this.api.get<ApiResponse<PageResponse<Exam>>>(
      this.teacherEndpoint,
      this.buildListParams(filters)
    );
  }

  getTeacherExam(id: number): Observable<ApiResponse<Exam>> {
    return this.api.get<ApiResponse<Exam>>(
      `${this.teacherEndpoint}/${id}`
    );
  }

  createTeacherExam(
    request: TeacherExamRequest
  ): Observable<ApiResponse<Exam>> {
    return this.api.post<ApiResponse<Exam>>(
      this.teacherEndpoint,
      request
    );
  }

  updateTeacherExam(
    id: number,
    request: TeacherExamRequest
  ): Observable<ApiResponse<Exam>> {
    return this.api.put<ApiResponse<Exam>>(
      `${this.teacherEndpoint}/${id}`,
      request
    );
  }

  deleteTeacherExam(id: number): Observable<ApiResponse<void>> {
    return this.api.delete<ApiResponse<void>>(
      `${this.teacherEndpoint}/${id}`
    );
  }

  publishTeacherExam(id: number): Observable<ApiResponse<Exam>> {
    return this.api.post<ApiResponse<Exam>>(
      `${this.teacherEndpoint}/${id}/publish`,
      {}
    );
  }

  getTeacherMarks(
    examId: number,
    page = 0,
    size = 20
  ): Observable<ApiResponse<PageResponse<ExamMark>>> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size);

    return this.api.get<ApiResponse<PageResponse<ExamMark>>>(
      `${this.teacherEndpoint}/${examId}/marks`,
      params
    );
  }

  saveTeacherMarks(
    examId: number,
    request: BulkExamMarksRequest
  ): Observable<ApiResponse<ExamMark[]>> {
    return this.api.put<ApiResponse<ExamMark[]>>(
      `${this.teacherEndpoint}/${examId}/marks`,
      request
    );
  }
}
