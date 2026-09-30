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