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
};