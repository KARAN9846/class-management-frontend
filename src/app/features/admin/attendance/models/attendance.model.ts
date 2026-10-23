export type AttendanceStatus = 'PRESENT' | 'ABSENT';

export interface Attendance {
  id: number;

  studentId: number;
  studentName: string;

  academicYearId: number;
  academicYearName: string;

  classId: number;
  className: string;

  sectionId: number;
  sectionName: string;

  attendanceDate: string;

  status: AttendanceStatus;

  markedByTeacherId: number;
  markedByTeacherName: string;

  lastUpdatedByTeacherId: number | null;
lastUpdatedByTeacherName: string | null;
}

export interface AttendancePageResponse {
  content: Attendance[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface AttendancePageQuery {
  page: number;
  size: number;
  dateFrom?: string;
  dateTo?: string;
  status?: AttendanceStatus;
  academicYearId?: number;
  classId?: number;
  sectionId?: number;
  search?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}
