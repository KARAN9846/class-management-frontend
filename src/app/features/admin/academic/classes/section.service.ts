import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiService } from '../../../../core/services/api.service';

import {
  Section,
  CreateSectionRequest,
  UpdateSectionRequest
} from './section.model';



interface ApiResponse<T>{

  success:boolean;

  message:string;

  data:T;

  errors:unknown;

}



@Injectable({
 providedIn:'root'
})
export class SectionService {


private readonly apiService = inject(ApiService);



getSections(
 classId:number
):Observable<ApiResponse<Section[]>>{


 const params = new HttpParams()
 .set(
   'classId',
   classId
 );


 return this.apiService
 .get<ApiResponse<Section[]>>(
   '/sections',
   params
 );


}



createSection(
 request:CreateSectionRequest
):Observable<ApiResponse<Section>>{


 return this.apiService
 .post<ApiResponse<Section>>(
   '/sections',
   request
 );


}



updateSection(
 id:number,
 request:UpdateSectionRequest
):Observable<ApiResponse<Section>>{


 return this.apiService
 .put<ApiResponse<Section>>(
   `/sections/${id}`,
   request
 );


}



deleteSection(
 id:number
):Observable<ApiResponse<void>>{


 return this.apiService
 .delete<ApiResponse<void>>(
   `/sections/${id}`
 );


}


}