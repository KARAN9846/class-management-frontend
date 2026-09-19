export interface TeacherAssignment {

  id: number;

  teacherId: number;
  teacherName: string;

  academicYearId: number;
  academicYearName: string;

  classId: number;
  className: string;

  sectionId: number;
  sectionName: string;

  subjectId: number;
  subjectName: string;
}

export interface TeacherAssignmentRequest {

  teacherId: number;

  academicYearId: number;

  classId: number;

  sectionId: number;

  subjectId: number;
}