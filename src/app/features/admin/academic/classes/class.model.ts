export interface AcademicClass {

  id:number;

  name:string;

  academicYearId:number;

  academicYear?:string;

  sections:Section[];

}



export interface Section {

  id:number;

  classId:number;

  name:string;

  createdAt?:string;

  updatedAt?:string;

}



export interface CreateSectionRequest {

  classId:number;

  name:string;

}