export type GlobalSearchResultType =
  | 'student'
  | 'teacher'
  | 'page'
  | 'action';


export type GlobalSearchActionId =
  | 'ADD_STUDENT'
  | 'ADD_TEACHER'
  | 'ADD_TEACHER_ROLE'
  | 'ASSIGN_TEACHER_ROLE'
  | 'ADD_TEACHER_ASSIGNMENT'
  | 'ADD_ASSIGNMENT'
  | 'ADD_FEE_STRUCTURE'
  | 'MARK_ATTENDANCE';

export interface GlobalSearchAction {
  id: GlobalSearchActionId;
  title: string;
  description: string;
  icon: string;
  route: string;
  roles: ('SUPER_ADMIN' | 'ADMIN' | 'TEACHER' | 'STUDENT')[];
  permission?: string;
  aliases?: string[];
}


export interface GlobalSearchMetadata {
  label: string;
  value: string;
}


export interface GlobalSearchResult {
  type: GlobalSearchResultType;

  id?: number;

  title: string;

  subtitle?: string;

  description?: string;

  icon: string;

  route?: string;

  metadata?: GlobalSearchMetadata[];
}


/**
 * Normalized student information used by
 * the Global Search Quick View.
 *
 * This keeps the search UI independent from
 * Admin Student and Teacher Student models.
 */
/**
 * Attendance summary used by
 * the Global Search Student Quick View.
 */
export interface GlobalSearchStudentAttendance {
  total: number;
  present: number;
  absent: number;
  percentage: number;
  recent: {
    date: string;
    status: 'PRESENT' | 'ABSENT';
  }[];
}


/**
 * Fee payment information used by
 * the Global Search Student Quick View.
 */
export interface GlobalSearchStudentPayment {
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  paymentType: string;
  status: string;
}


/**
 * Fee information used by
 * the Global Search Student Quick View.
 */
export interface GlobalSearchStudentFee {
  id: number;

  originalAmount: number;
  discountAmount: number;

  payableAmount: number;
  paidAmount: number;
  remainingAmount: number;

  status: string;

  payments: GlobalSearchStudentPayment[];
}


/**
 * Normalized student information used by
 * the Global Search Quick View.
 *
 * This keeps the search UI independent from
 * Admin Student and Teacher Student models.
 */
export interface GlobalSearchStudentQuickView {

  id: number;

  name: string;

  email?: string;

  phone?: string;

  rollNumber?: string;

  enrollmentNumber?: string;

  className?: string;

  sectionName?: string;

  academicYearName?: string;

  isActive?: boolean;

  attendance?: GlobalSearchStudentAttendance;

  fees?: GlobalSearchStudentFee[];
}

export interface GlobalSearchTeacherQuickView {
  id: number;
  name: string;
  teacherNumber?: string;
  email?: string;
  phone?: string;
  isActive?: boolean;

  role?: {
    id: number;
    name: string;
    description?: string | null;
    isActive?: boolean;
  };

  assignments: {
    academicYearName?: string;
    scopeType: string;
    className?: string | null;
    sectionName?: string | null;
  }[];

  permissions: {
    id: number;
    code: string;
    name: string;
    description?: string | null;
  }[];
  
}