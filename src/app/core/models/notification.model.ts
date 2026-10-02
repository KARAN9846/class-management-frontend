
export interface AbsentStudentNotification {
  studentId: number;
  studentName: string;
  rollNumber: string;

  classId: number;
  className: string;

  sectionId: number;
  sectionName: string;

  attendanceDate: string;
}

export interface NotificationApiResponse {
  success: boolean;
  message: string;
  data: AbsentStudentNotification[];
}

export interface PendingAttendanceNotification {
  classId: number;
  className: string;

  sectionId: number;
  sectionName: string;

  academicYearId: number;
  academicYearName: string;

  totalStudents: number;
  markedStudents: number;
  pendingStudents: number;
}

export interface PendingAttendanceApiResponse {
  success: boolean;
  message: string;
  data: PendingAttendanceNotification[];
}