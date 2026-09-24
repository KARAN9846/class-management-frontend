export interface Student {
  id: number;
  rollNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  isActive: boolean;

  academicYearId: number;
  academicYearName: string;

  classId: number;
  className: string;

  sectionId: number;
  sectionName: string;

  schoolId: number | null;
schoolName: string | null;
}

export interface StudentDetails extends Student {
  enrollmentNumber: string;

  academicYearId: number;
  academicYearName: string;

  classId: number;
  className: string;

  sectionId: number;
  sectionName: string;
}

export interface CreateStudentRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;

  academicYearId: number;
  classId: number;
  sectionId: number;

  schoolId: number | null;

  discountType: 'NONE' | 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
}

export interface UpdateStudentRequest {
  rollNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;

  academicYearId: number;
  classId: number;
  sectionId: number;

  schoolId: number | null;
}