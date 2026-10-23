
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

export interface PendingLeaveNotification {
  id: number;
  applicantName: string | null;
  studentId: number | null;
  teacherId: number | null;
  startDate: string;
  endDate: string;
  dayPortion: string;
  reason: string;
  status: 'PENDING';
}

export interface PendingLeaveApiResponse {
  success: boolean;
  message: string;
  data: { content: PendingLeaveNotification[]; totalElements: number; totalPages: number; number: number; size: number };
}
