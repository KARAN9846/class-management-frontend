import { AttendanceStatus } from '../../../admin/attendance/models/attendance.model';

export interface UpdateAttendanceRequest {
  status: AttendanceStatus;
}