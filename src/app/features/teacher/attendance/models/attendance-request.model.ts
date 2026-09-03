import { AttendanceStatus } from '../../../admin/attendance/models/attendance.model';

export interface StudentAttendanceRequest {
  studentId: number;
  status: AttendanceStatus;
}

export interface MarkAttendanceRequest {
  assignmentId: number;
  attendanceDate: string;
  students: StudentAttendanceRequest[];
}

