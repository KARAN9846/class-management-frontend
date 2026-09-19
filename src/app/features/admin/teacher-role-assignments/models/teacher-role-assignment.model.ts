export type TeacherScopeType =
  | 'CLASS_SCOPE'
  | 'ALL_CLASSES_SCOPE';


export interface TeacherRoleScope {

  id?: number;

  academicYearId: number;

  academicYearName?: string;

  scopeType: TeacherScopeType;

  classId?: number | null;

  className?: string | null;

  sectionId?: number | null;

  sectionName?: string | null;
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

  scopeType: TeacherScopeType;

  classId?: number | null;

  sectionId?: number | null;
}