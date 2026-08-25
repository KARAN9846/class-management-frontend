export const API_ENDPOINTS = {
 TEACHERS:{
  BASE:'/teachers',
  BY_ID:(id:number)=>`/teachers/${id}`,
  STATUS:(id:number)=>`/teachers/${id}/status`
 },

 STUDENTS: {
  BASE: '/students',

  BY_ID: (id: number) =>
    `/students/${id}`,

  STATUS: (id: number) =>
    `/students/${id}/status`
},
};