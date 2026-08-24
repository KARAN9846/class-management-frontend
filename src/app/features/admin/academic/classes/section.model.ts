export interface Section {

  id:number;

  classId:number;

  name:string;

  createdAt:string;

  updatedAt:string;

}



export interface CreateSectionRequest {

  classId:number;

  name:string;

}



export interface UpdateSectionRequest {

  classId:number;

  name:string;

}