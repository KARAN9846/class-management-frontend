export interface AdminDetails {
  id: number;
  userId: number;
  email: string;
  organizationName: string;
  adminCode: string;
  isActive: boolean;
  createdAt: string;

  teacherCount: number;
  activeTeacherCount: number;

  studentCount: number;
  activeStudentCount: number;

  academicYearCount: number;
  activeAcademicYearCount: number;

  classCount: number;
  sectionCount: number;
  subjectCount: number;

  assignedRoleCount: number;

  assignmentCount: number;
  publishedAssignmentCount: number;
  draftAssignmentCount: number;
  closedAssignmentCount: number;

  attendanceCount: number;

  currentAcademicYear: string | null;
}