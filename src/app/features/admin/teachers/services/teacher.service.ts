import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';

import { ApiService } from '../../../../core/services/api.service';
import { API_ENDPOINTS } from '../../../../core/constants/api-endpoints';
import { Teacher } from '../models/teacher.model';

export interface TeacherPage {
  content: Teacher[];
  totalElements: number;
}

export interface TeacherListResponse {
  data: TeacherPage;
}

export interface TeacherResponse {
  data: Teacher;
}

@Injectable({
  providedIn: 'root'
})
export class TeacherService {

  private readonly api = inject(ApiService);


  getTeachers(
    page = 0,
    size = 50,
    search = ''
  ): Observable<TeacherListResponse> {

    const params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('search', search)
      .set('sortBy', 'firstName')
      .set('sortDirection', 'asc');


    return this.api.get<TeacherListResponse>(
      API_ENDPOINTS.TEACHERS.BASE,
      params
    );
  }


  getTeacherById(
    id: number
  ): Observable<any> {

    return this.api.get(
      API_ENDPOINTS.TEACHERS.BY_ID(id)
    );
  }


  createTeacher(
    data: any
  ): Observable<Teacher> {

    return this.api.post<Teacher>(
      API_ENDPOINTS.TEACHERS.BASE,
      data
    );
  }


  updateTeacher(
    id: number,
    data: any
  ): Observable<Teacher> {

    return this.api.put<Teacher>(
      API_ENDPOINTS.TEACHERS.BY_ID(id),
      data
    );
  }


updateStatus(
  id: number,
  isActive: boolean
): Observable<TeacherResponse> {

  return this.api.patch<TeacherResponse>(
    API_ENDPOINTS.TEACHERS.STATUS(id),
    {
      isActive
    }
  );
}

deleteTeacher(
  id: number
): Observable<void> {

  return this.api.delete<void>(
    API_ENDPOINTS.TEACHERS.BY_ID(id)
  );

}
}
