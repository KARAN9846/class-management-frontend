export const API_ENDPOINTS = {
 TEACHERS:{
  BASE:'/teachers',
  BY_ID:(id:number)=>`/teachers/${id}`,
  STATUS:(id:number)=>`/teachers/${id}/status`
 }
};