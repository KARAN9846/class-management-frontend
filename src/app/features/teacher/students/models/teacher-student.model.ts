// =========================================================
// TEACHER STUDENT RESPONSE
// =========================================================

export interface TeacherStudent {
  studentId: number;

  name: string;

  rollNumber: string | null;
  email: string | null;
  phone: string | null;
  alternatePhone: string | null;
  address: string | null;

  isActive: boolean | null;

  enrollmentNumber: string;

  academicYearId: number;
  academicYearName: string;

  classId: number;
  className: string;

  sectionId: number;
  sectionName: string;
}


// =========================================================
// PAGINATED RESPONSE
// =========================================================

export interface TeacherStudentPage {
  content: TeacherStudent[];

  totalElements: number;
  totalPages: number;

  size: number;
  number: number;

  first?: boolean;
  last?: boolean;
}


// =========================================================
// API RESPONSE
// =========================================================

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}


// =========================================================
// GET STUDENTS QUERY
// =========================================================

export interface TeacherStudentQuery {
  page?: number;
  size?: number;
  search?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}


// =========================================================
// CREATE STUDENT REQUEST
// =========================================================

export interface CreateStudentRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  alternatePhone?: string;
  address?: string;

  academicYearId: number;
  classId: number;
  sectionId: number;
}


// =========================================================
// UPDATE STUDENT REQUEST
// =========================================================

export interface UpdateStudentRequest {
  name: string;
  email: string;
  phone?: string;
  alternatePhone?: string;
  address?: string;
  rollNumber?: string;

  academicYearId: number;
  classId: number;
  sectionId: number;
}

// =========================================================
// TEACHER STUDENT SCOPE OPTION
// =========================================================

export interface TeacherStudentScopeOption {
  academicYearId: number;
  academicYearName: string;

  classId: number;
  className: string;

  sectionId: number | null;
  sectionName: string | null;
}
