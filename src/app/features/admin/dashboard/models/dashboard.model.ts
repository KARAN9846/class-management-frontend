

// =========================================================
// STUDENT DASHBOARD
// =========================================================

export interface StudentDashboardData {
  totalStudents: number;
  activeStudents: number;
  inactiveStudents: number;
}


// =========================================================
// TEACHER DASHBOARD
// =========================================================

export interface TeacherDashboardData {
  totalTeachers: number;
  activeTeachers: number;
  inactiveTeachers: number;
}


// =========================================================
// TEACHER ASSIGNMENT DASHBOARD
// =========================================================

export interface AssignmentCount {
  teacherId: number;
  teacherName: string;
  assignmentCount: number;
}

export interface AssignmentDashboardData {
  totalAssignments: number;
  assignedTeachers: number;
  coveredClasses: number;
  coveredSubjects: number;
  currentAcademicYear: string | null;
  assignmentsByTeacher: AssignmentCount[];
}


// =========================================================
// ACADEMIC STRUCTURE DASHBOARD
// =========================================================

export interface AcademicStructureSection {
  id: number;
  name: string;
}

export interface AcademicStructureSubject {
  id: number;
  name: string;
  code: string;
}

export interface AcademicStructureClass {
  id: number;
  name: string;
  sectionCount: number;
  subjectCount: number;
  sections: AcademicStructureSection[];
  subjects: AcademicStructureSubject[];
}

export interface AcademicStructureDashboardData {
  totalAcademicYears: number;
  totalClasses: number;
  totalSections: number;
  totalSubjects: number;
  currentAcademicYear: string | null;
  classes: AcademicStructureClass[];
}


// =========================================================
// ATTENDANCE DASHBOARD
// =========================================================

export interface AttendanceDailyTrend {
  date: string;
  present: number;
  absent: number;
  total: number;
  attendanceRate: number;
}

export interface AttendanceClassSummary {
  classId: number;
  className: string;
  present: number;
  absent: number;
  total: number;
  attendanceRate: number;
}

export interface AttendanceMonthlySummary {
  present: number;
  absent: number;
  total: number;
  attendanceRate: number;
}

export interface AttendanceRecentRecord {
  studentId: number;
  studentName: string;
  classId: number;
  className: string;
  sectionName: string;
  attendanceDate: string;
  status: string;
}

export interface AttendanceDashboardData {

  // Today's summary
  totalMarked: number;
  present: number;
  absent: number;
  attendanceRate: number;

  // Monthly / daily trend
  monthlyTrend: AttendanceDailyTrend[];

  // Class-wise attendance
  classSummaries: AttendanceClassSummary[];

  // Selected class monthly summary
  selectedClassMonthlySummary: AttendanceMonthlySummary | null;

  // Recent attendance records
  recentRecords: AttendanceRecentRecord[];
}


// =========================================================
// FINANCE DASHBOARD
// =========================================================

export interface FinanceClassSummary {
  classId: number;
  className: string;
  expectedAmount: number;
  collectedAmount: number;
  pendingAmount: number;
  collectionPercentage: number;
}

export interface FinanceMonthlySummary {
  month: number;
  monthName: string;
  collectedAmount: number;
}

export interface FinanceDashboardData {
  // Overall fee amounts
  totalExpected: number;
  totalCollected: number;
  totalPending: number;
  collectionPercentage: number;
  totalDiscount: number;

  // Student payment status
  totalStudents: number;
  fullyPaidStudents: number;
  pendingStudents: number;

  // Charts / breakdowns
  classWiseSummary: FinanceClassSummary[];
  monthlySummary: FinanceMonthlySummary[];
}