export type LeaveDayPortion = 'FULL_DAY' | 'FIRST_HALF' | 'SECOND_HALF';
export type LeaveRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
export type LeaveApplicantType = 'STUDENT' | 'TEACHER';
export type LeaveSortField = 'id' | 'createdAt' | 'startDate' | 'endDate' | 'status';
export type LeaveSortDirection = 'asc' | 'desc';

export interface LeaveRequestFilters {
  q?: string;
  applicantType?: LeaveApplicantType;
  status?: LeaveRequestStatus;
  leaveStartFrom?: string;
  leaveEndTo?: string;
  submittedFrom?: string;
  submittedTo?: string;
  sortBy?: LeaveSortField;
  sortDirection?: LeaveSortDirection;
}

export interface LeaveHistory {
  id: number;
  actorType: 'ADMIN' | 'STUDENT' | 'TEACHER';
  eventType: 'SUBMITTED' | 'CANCELLED' | 'APPROVED' | 'REJECTED';
  previousStatus: LeaveRequestStatus | null;
  newStatus: LeaveRequestStatus;
  comment: string | null;
  createdAt: string;
}

export interface LeaveRequest {
  id: number;
  applicantName: string | null;
  adminId: number;
  studentId: number | null;
  teacherId: number | null;
  startDate: string;
  endDate: string;
  dayPortion: LeaveDayPortion;
  reason: string;
  status: LeaveRequestStatus;
  adminComment: string | null;
  reviewedBy: number | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
  dayCount: number;
  history: LeaveHistory[];
  academicYearId?: number | null;
  classId?: number | null;
  sectionId?: number | null;
  reviewedByTeacherId?: number | null;
}

export interface LeaveSummary {
  academicYearId: number;
  academicYearName: string;
  academicYearStartDate: string;
  academicYearEndDate: string;
  approvedLeaveDays: number;
  pendingLeaveDays: number;
  rejectedLeaveDays: number;
  rejectedRequestCount: number;
  cancelledLeaveDays: number;
  cancelledRequestCount: number;
  approvedRequestCount: number;
  pendingRequestCount: number;
}

export interface LeaveRequestPage {
  content: LeaveRequest[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface AcademicYearPage {
  content: import('../../admin/academic/academic-years/academic-year.model').AcademicYear[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface LeaveApplicantReport {
  applicantId: number;
  applicantType: LeaveApplicantType;
  applicantName: string | null;
  summary: LeaveSummary;
  requests: LeaveRequestPage;
}

export interface LeaveRequestPayload {
  startDate: string;
  endDate: string;
  dayPortion: LeaveDayPortion;
  reason: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: unknown;
}
