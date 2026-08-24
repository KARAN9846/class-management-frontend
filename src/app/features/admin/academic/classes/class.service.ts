import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '../../../../core/services/api.service';

import {
  AcademicClass
} from './class.model';



interface ApiResponse<T> {

  success:boolean;

  message:string;

  data:T;

  errors:unknown;

}



export interface CreateClassRequest {

  academicYearId:number;

  name:string;

}



export interface UpdateClassRequest {

  academicYearId:number;

  name:string;

}




@Injectable({
  providedIn:'root'
})
export class ClassService {



private readonly apiService =
inject(ApiService);





getClasses():

Observable<ApiResponse<AcademicClass[]>> {


return this.apiService.get<
ApiResponse<AcademicClass[]>
>('/classes');


}





getClassById(
id:number
):

Observable<ApiResponse<AcademicClass>> {


return this.apiService.get<
ApiResponse<AcademicClass>
>(
`/classes/${id}`
);


}





createClass(
request:CreateClassRequest
):

Observable<ApiResponse<AcademicClass>> {


return this.apiService.post<
ApiResponse<AcademicClass>
>(
'/classes',
request
);


}






updateClass(
id:number,
request:UpdateClassRequest
):

Observable<ApiResponse<AcademicClass>> {


return this.apiService.put<
ApiResponse<AcademicClass>
>(
`/classes/${id}`,
request
);


}






deleteClass(
id:number
):

Observable<ApiResponse<void>> {


return this.apiService.delete<
ApiResponse<void>
>(
`/classes/${id}`
);


}



}