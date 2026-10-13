export type ExamStatus = 'DRAFT' | 'PUBLISHED' | 'CANCELLED';

export type ExamCreatorType = 'ADMIN' | 'TEACHER';

export type ExamMarkStatus =
  | 'PENDING'
  | 'SCORED'
  | 'ABSENT'
  | 'EXEMPT'
  | 'NOT_APPLICABLE';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: unknown;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface Exam {
  id: number;

  academicYearId: number;
  academicYearName: string;

  classId: number;
  className: string;

  sectionId: number;
  sectionName: string;

  subjectId: number;
  subjectName: string;
  subjectCode: string;

  createdByUserId: number;
  creatorType: ExamCreatorType;
  teacherAssignmentId: number | null;

  title: string;
  description: string | null;
  examDate: string;
  maximumMarks: number;

  status: ExamStatus;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  publishedByUserId: number | null;
  version: number;
}

export interface AdminExamRequest {
  academicYearId: number;
  classId: number;
  sectionId: number;
  subjectId: number;
  title: string;
  description: string | null;
  examDate: string;
  maximumMarks: number;
  version?: number;
}

export interface TeacherExamRequest {
  teacherAssignmentId: number;
  title: string;
  description: string | null;
  examDate: string;
  maximumMarks: number;
  version?: number;
}

export interface ExamMark {
  candidateId: number;
  studentId: number | null;
  enrollmentId: number | null;
  firstName: string;
  lastName: string;
  rollNumber: string | null;
  enrollmentNumber: string;
  markStatus: ExamMarkStatus;
  score: number | null;
  version: number;
  updatedAt: string;
}

export interface ExamMarkEntryRequest {
  candidateId: number;
  markStatus: ExamMarkStatus;
  score: number | null;
  version: number;
}

export interface BulkExamMarksRequest {
  entries: ExamMarkEntryRequest[];
}

export interface ExamListFilters {
  search?: string;
  status?: ExamStatus;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface AdminExamFilters extends ExamListFilters {
  academicYearId?: number;
  classId?: number;
  sectionId?: number;
  subjectId?: number;
}
