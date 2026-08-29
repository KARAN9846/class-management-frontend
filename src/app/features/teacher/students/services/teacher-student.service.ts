import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiService } from '../../../../core/services/api.service';

import {
  TeacherStudent,
  TeacherStudentPage,
  ApiResponse
} from '../models/teacher-student.model';

@Injectable({
  providedIn: 'root'
})
export class TeacherStudentService {

  private readonly api = inject(ApiService);

  getStudents(
    page = 0,
    size = 10,
    search = ''
  ): Observable<ApiResponse<TeacherStudentPage>> {

    const params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('search', search)
      .set('sortBy', 'firstName')
      .set('sortDirection', 'asc');

    return this.api.get<ApiResponse<TeacherStudentPage>>(
      '/teacher/students',
      params
    );
  }

  getStudentById(
    id: number
  ): Observable<ApiResponse<TeacherStudent>> {

    return this.api.get<ApiResponse<TeacherStudent>>(
      `/teacher/students/${id}`
    );
  }
}