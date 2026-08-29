export interface TeacherRoleScope {
  id?: number;
  academicYearId: number;
  academicYearName?: string;
  classId: number;
  className?: string;
  sectionId?: number;
  sectionName?: string;
}

export interface TeacherRoleAssignment {
  id: number;
  teacherId: number;
  teacherNumber: string;
  teacherName: string;
  teacherRoleId: number;
  teacherRoleName: string;
  scopes: TeacherRoleScope[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTeacherRoleAssignmentRequest {
  teacherId: number;
  teacherRoleId: number;
  scopes: TeacherRoleScopeRequest[];
}

export interface TeacherRoleScopeRequest {
  academicYearId: number;
  classId: number;
  sectionId?: number;
}
