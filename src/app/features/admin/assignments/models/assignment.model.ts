export type AssignmentStatus =
  | 'DRAFT'
  | 'PUBLISHED'
  | 'CLOSED';

export interface Assignment {
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

  teacherId: number;
  teacherName: string;

  title: string;
  description: string;

  dueDate: string;

  maxMarks: number;

  status: AssignmentStatus;

  createdAt: string;
  updatedAt: string;
}

export interface AssignmentRequest {
  academicYearId: number;
  classId: number;
  sectionId: number;
  subjectId: number;
  teacherId: number;

  title: string;
  description: string;

  dueDate: string;

  maxMarks: number;

  status?: AssignmentStatus;
}