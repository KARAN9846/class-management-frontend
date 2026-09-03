export interface TeacherAttendanceAssignment {
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
