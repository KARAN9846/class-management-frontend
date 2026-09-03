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