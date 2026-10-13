export type StudentExamMarkStatus =
  | 'PENDING'
  | 'SCORED'
  | 'ABSENT'
  | 'EXEMPT'
  | 'NOT_APPLICABLE';

export interface StudentExamResult {
  examId: number;
  title: string;
  description: string | null;
  examDate: string;
  maximumMarks: number;
  academicYearName: string;
  className: string;
  sectionName: string;
  subjectName: string;
  subjectCode: string;
  publishedAt: string | null;
  markStatus: StudentExamMarkStatus;
  score: number | null;
  updatedAt: string | null;
}

export interface StudentExamApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[] | null;
}
