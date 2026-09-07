export const API_ENDPOINTS = {
  ADMINS: {
    BASE: '/admins',

    BY_ID: (id: number) =>
      `/admins/${id}`,

    DETAILS: (id: number) =>
      `/admins/${id}/details`,

    STATUS: (id: number) =>
      `/admins/${id}/status`
  },

  TEACHERS: {
    BASE: '/teachers',

    BY_ID: (id: number) =>
      `/teachers/${id}`,

    STATUS: (id: number) =>
      `/teachers/${id}/status`
  },

  STUDENTS: {
    BASE: '/students',

    BY_ID: (id: number) =>
      `/students/${id}`,

    STATUS: (id: number) =>
      `/students/${id}/status`
  }
  ,
    FEE_STRUCTURES: {
    BASE: '/fee-structures',

    BY_ID: (id: number) =>
      `/fee-structures/${id}`,

    STATUS: (id: number) =>
      `/fee-structures/${id}/status`
  }
,
STUDENT_FEES: {
  BASE: '/student-fees',
  BY_ID: (id: number) => `/student-fees/${id}`,
  BY_CLASS: '/student-fees/class'
},

FEE_PAYMENTS: {
  BASE: '/fee-payments',
  BY_STUDENT_FEE: (studentFeeId: number) =>
    `/fee-payments/student-fee/${studentFeeId}`
},
};