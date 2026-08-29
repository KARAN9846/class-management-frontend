export interface TeacherStudent {
  studentId: number;

  firstName: string;
  lastName: string;

  rollNumber: string | null;
  email: string | null;
  phone: string | null;

  isActive: boolean | null;

  enrollmentNumber: string;

  academicYearId: number;
  academicYearName: string;

  classId: number;
  className: string;

  sectionId: number;
  sectionName: string;
}

export interface TeacherStudentPage {
  content: TeacherStudent[];

  totalElements: number;
  totalPages: number;

  size: number;
  number: number;

  first?: boolean;
  last?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
