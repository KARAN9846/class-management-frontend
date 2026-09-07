
import { Routes } from '@angular/router';

// =========================================================
// AUTH
// =========================================================

import { LoginComponent } from './features/auth/login/login.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

// =========================================================
// LAYOUT
// =========================================================

import { AppLayoutComponent } from './layouts/app-layout/app-layout.component';

// =========================================================
// ERROR PAGES
// =========================================================

import { AccessDeniedComponent } from './features/errors/access-denied/access-denied.component';
import { NotFoundComponent } from './features/errors/not-found/not-found.component';
import { ServerErrorComponent } from './features/errors/server-error/server-error.component';

// =========================================================
// SHARED
// =========================================================

import { PagePlaceholderComponent } from './shared/components/page-placeholder/page-placeholder.component';

// =========================================================
// SUPER ADMIN
// =========================================================

import { SuperAdminDashboard } from './features/super-admin/dashboard/super-admin-dashboard/super-admin-dashboard';
import { AdminDetailsComponent } from './features/super-admin/admins/admin-details/admin-details';
import { AdminEditComponent } from './features/super-admin/admins/admin-edit/admin-edit';
import { AdminCreateComponent } from './features/super-admin/admins/admin-create/admin-create';


// =========================================================
// ADMIN
// =========================================================

import { AdminDashboard } from './features/admin/dashboard/admin-dashboard/admin-dashboard';

import { TeacherRoleList } from './features/admin/teacher-roles/teacher-role-list/teacher-role-list';
import { TeacherRoleForm } from './features/admin/teacher-roles/teacher-role-form/teacher-role-form';

import { TeacherRoleAssignmentList } from './features/admin/teacher-role-assignments/teacher-role-assignment-list/teacher-role-assignment-list';
import { TeacherRoleAssignmentForm } from './features/admin/teacher-role-assignments/teacher-role-assignment-form/teacher-role-assignment-form';
import { TeacherRoleAssignmentView } from './features/admin/teacher-role-assignments/teacher-role-assignment-view/teacher-role-assignment-view';

import { AcademicYearsComponent } from './features/admin/academic/academic-years/academic-years';
import { ClassesComponent } from './features/admin/academic/classes/classes';
import { SubjectsComponent } from './features/admin/academic/subjects/subjects';

import { TeacherList } from './features/admin/teachers/teacher-list/teacher-list';
import { TeacherDetails } from './features/admin/teachers/teacher-details/teacher-details';
import { TeacherForm } from './features/admin/teachers/teacher-form/teacher-form';
import { StudentList } from './features/admin/students/student-list/student-list';
import { StudentForm } from './features/admin/students/student-form/student-form';

import { AssignmentList } from './features/admin/assignments/assignment-list/assignment-list';
import { AssignmentForm } from './features/admin/assignments/assignment-form/assignment-form';

import { FeeStructureList } from './features/admin/fees/fee-structure-list/fee-structure-list';
import { FeeStructureCreateComponent } from './features/admin/fees/fee-structure-create/fee-structure-create';
import { StudentFeeList } from './features/admin/fees/student-fee-list/student-fee-list';
import { AddPayment } from './features/admin/fees/add-payment/add-payment';

// =========================================================
// TEACHER
// =========================================================

import { TeacherDashboard } from './features/teacher/dashboard/teacher-dashboard/teacher-dashboard';

import { TeacherAssignmentList } from './features/teacher/assignments/teacher-assignment-list/teacher-assignment-list';
import { TeacherAssignmentForm } from './features/teacher/assignments/teacher-assignment-form/teacher-assignment-form';

import { TeacherStudentListComponent } from './features/teacher/students/teacher-student-list/teacher-student-list';
import { TeacherAttendanceComponent } from './features/teacher/attendance/teacher-attendance/teacher-attendance';
import { MarkAttendanceComponent } from './features/teacher/attendance/mark-attendance/mark-attendance';
import {
  TeacherStudentFormComponent
} from './features/teacher/students/assigned-students/teacher-student-form/teacher-student-form';

// =========================================================
// STUDENT
// =========================================================

import { StudentDashboard } from './features/student/dashboard/student-dashboard/student-dashboard';
import { StudentAttendanceComponent } from './features/student/attendance/student-attendance/student-attendance';

// =======================================================
// Attendance Overview
// =======================================================
import { AttendanceOverview } from './features/admin/attendance/attendance-overview/attendance-overview';
import { EditAttendanceComponent } from './features/teacher/attendance/edit-attendance/edit-attendance';
import { AdminListComponent } from './features/super-admin/admins/admin-list/admin-list';
import { StudentFeeView } from './features/admin/fees/student-fee-view/student-fee-view';
import { FeeStructureEdit } from './features/admin/fees/fee-structure-edit/fee-structure-edit';

// =========================================================
// ROUTES
// =========================================================

export const routes: Routes = [

  // =======================================================
  // LOGIN
  // =======================================================

  {
    path: 'login',
    component: LoginComponent
  },

  // =======================================================
  // ACCESS DENIED
  // =======================================================

  {
    path: 'access-denied',
    component: AccessDeniedComponent
  },

  // =======================================================
  // MAIN APPLICATION
  // =======================================================

  {
    path: '',
    component: AppLayoutComponent,
    canActivate: [authGuard],

    children: [

      // ===================================================
      // SUPER ADMIN
      // ===================================================

      {
        path: 'super-admin/admins/create',
        component: AdminCreateComponent,
        canActivate: [roleGuard],
        data: { roles: ['SUPER_ADMIN'] }
      },

      {
        path: 'super-admin/admins/:id/edit',
        component: AdminEditComponent,
        canActivate: [roleGuard],
        data: { roles: ['SUPER_ADMIN'] }
      },

      {
        path: 'super-admin/dashboard',
        component: SuperAdminDashboard,

        canActivate: [roleGuard],

        data: {
          roles: ['SUPER_ADMIN']
        }
      },
      {
        path: 'super-admin/admins/:id/details',
        component: AdminDetailsComponent,

        canActivate: [roleGuard],

        data: {
          roles: ['SUPER_ADMIN']
        }
      },

      {
        path: 'super-admin/admins',
        component: AdminListComponent,
        canActivate: [roleGuard],
        data: {
          roles: ['SUPER_ADMIN']
        }
      },

      // ===================================================
      // ADMIN
      // ===================================================

      // ------------------- DASHBOARD ---------------------

      {
        path: 'admin/dashboard',
        component: AdminDashboard,

        canActivate: [roleGuard],

        data: {
          roles: ['ADMIN']
        }
      },

      // ------------------- ACADEMIC ----------------------

      {
        path: 'admin/academic-years',
        component: AcademicYearsComponent,

        canActivate: [roleGuard],

        data: {
          roles: ['ADMIN']
        }
      },

      {
        path: 'admin/classes',
        component: ClassesComponent,

        canActivate: [roleGuard],

        data: {
          roles: ['ADMIN']
        }
      },

      {
        path: 'admin/subjects',
        component: SubjectsComponent,

        canActivate: [roleGuard],

        data: {
          roles: ['ADMIN']
        }
      },

      // ------------------- TEACHERS ----------------------

      {
        path: 'admin/teachers/create',
        component: TeacherForm,

        canActivate: [roleGuard],

        data: {
          roles: ['ADMIN']
        }
      },

      {
        path: 'admin/teachers/:id/edit',
        component: TeacherForm,

        canActivate: [roleGuard],

        data: {
          roles: ['ADMIN']
        }
      },

      {
        path: 'admin/teachers',
        component: TeacherList,

        canActivate: [roleGuard],

        data: {
          roles: ['ADMIN']
        }
      },

      // ------------------- STUDENTS ----------------------

      {
        path: 'admin/students/create',
        component: StudentForm,

        canActivate: [roleGuard],

        data: {
          roles: ['ADMIN']
        }
      },

      {
        path: 'admin/students/:id/edit',
        component: StudentForm,

        canActivate: [roleGuard],

        data: {
          roles: ['ADMIN']
        }
      },

      {
        path: 'admin/students',
        component: StudentList,

        canActivate: [roleGuard],

        data: {
          roles: ['ADMIN'],
          title: 'Students',
          description: 'Manage students.'
        }
      },

      // ------------------- TEACHER ROLES ----------------

      {
        path: 'admin/teacher-roles/create',
        component: TeacherRoleForm,

        canActivate: [roleGuard],

        data: {
          roles: ['ADMIN']
        }
      },

      {
        path: 'admin/teacher-roles/:id/edit',
        component: TeacherRoleForm,

        canActivate: [roleGuard],

        data: {
          roles: ['ADMIN']
        }
      },

      {
        path: 'admin/teacher-roles',
        component: TeacherRoleList,

        canActivate: [roleGuard],

        data: {
          roles: ['ADMIN']
        }
      },

      // ------------------- TEACHER ROLE ASSIGNMENTS ----

      {
        path: 'admin/teacher-role-assignments/create',
        component: TeacherRoleAssignmentForm,

        canActivate: [roleGuard],

        data: {
          roles: ['ADMIN']
        }
      },

      {
        path: 'admin/teacher-role-assignments/:teacherId/edit',
        component: TeacherRoleAssignmentForm,

        canActivate: [roleGuard],

        data: {
          roles: ['ADMIN']
        }
      },

      {
        path: 'admin/teacher-role-assignments/:teacherId/view',
        component: TeacherRoleAssignmentView,

        canActivate: [roleGuard],

        data: {
          roles: ['ADMIN']
        }
      },

      {
        path: 'admin/teacher-role-assignments',
        component: TeacherRoleAssignmentList,

        canActivate: [roleGuard],

        data: {
          roles: ['ADMIN']
        }
      },

      // ------------------- ASSIGNMENTS ------------------

      {
        path: 'admin/assignments/create',
        component: AssignmentForm,

        canActivate: [roleGuard],

        data: {
          roles: ['ADMIN']
        }
      },

      {
        path: 'admin/assignments/:id/edit',
        component: AssignmentForm,

        canActivate: [roleGuard],

        data: {
          roles: ['ADMIN']
        }
      },

      {
        path: 'admin/assignments',
        component: AssignmentList,

        canActivate: [roleGuard],

        data: {
          roles: ['ADMIN']
        }
      },

      // ------------------- ATTENDANCE -------------------

      {
        path: 'admin/attendance',
        component: AttendanceOverview,

        canActivate: [roleGuard],

        data: {
          roles: ['ADMIN'],
          title: 'Attendance',
          description: 'Manage attendance.'
        }
      },


      // ------------------- FEES -------------------------

      {
        path: 'admin/fees/fee-structures/create',
        component: FeeStructureCreateComponent,
        canActivate: [roleGuard],
        data: {
          roles: ['ADMIN']
        }
      },

      {
        path: 'admin/fees/fee-structures',
        component: FeeStructureList,
        canActivate: [roleGuard],
        data: {
          roles: ['ADMIN']
        }
      },

      {
        path: 'admin/fees/student-fees',
        component: StudentFeeList,
        canActivate: [roleGuard],
        data: {
          roles: ['ADMIN']
        }
      },

{
  path: 'admin/fees/student-fees/:id/payment',
  component: AddPayment,
  canActivate: [roleGuard],
  data: { roles: ['ADMIN'] }
},
{
  path: 'admin/fees/student-fees/:id/edit',
  component: StudentFeeView,
  canActivate: [roleGuard],
  data: { roles: ['ADMIN'] }
},
{
  path: 'admin/fees/student-fees/:id',
  component: StudentFeeView,
  canActivate: [roleGuard],
  data: { roles: ['ADMIN'] }
},


      // ===================================================
      // TEACHER
      // ===================================================

      // ------------------- DASHBOARD ---------------------

      {
        path: 'teacher/dashboard',
        component: TeacherDashboard,

        canActivate: [roleGuard],

        data: {
          roles: ['TEACHER']
        }
      },

      // ------------------- ATTENDANCE ----------------------

      {
        path: 'teacher/attendance/mark',
        component: MarkAttendanceComponent,

        canActivate: [roleGuard],

        data: {
          roles: ['TEACHER']
        }
      },

      {
        path: 'teacher/attendance/edit/:id',
        component: EditAttendanceComponent,
        canActivate: [roleGuard],
        data: {
          roles: ['TEACHER']
        }
      },

      {
        path: 'teacher/attendance',
        component: TeacherAttendanceComponent,

        canActivate: [roleGuard],

        data: {
          roles: ['TEACHER']
        }
      },

      // ------------------- ASSIGNMENTS -------------------

      {
        path: 'teacher/assignments/:id/edit',
        component: TeacherAssignmentForm,

        canActivate: [roleGuard],

        data: {
          roles: ['TEACHER']
        }
      },

      {
        path: 'teacher/assignments',
        component: TeacherAssignmentList,

        canActivate: [roleGuard],

        data: {
          roles: ['TEACHER']
        }
      },

      // ------------------- STUDENTS ----------------------

      {
        path: 'teacher/students/create',
        component: TeacherStudentFormComponent,

        canActivate: [roleGuard],

        data: {
          roles: ['TEACHER']
        }
      },

      {
        path: 'teacher/students/:id/edit',
        component: TeacherStudentFormComponent,

        canActivate: [roleGuard],

        data: {
          roles: ['TEACHER']
        }
      },

      {
        path: 'teacher/students',
        component: TeacherStudentListComponent,

        canActivate: [roleGuard],

        data: {
          roles: ['TEACHER']
        }
      },

      // ===================================================
      // STUDENT
      // ===================================================

      // ------------------- DASHBOARD ---------------------

      {
        path: 'student/dashboard',
        component: StudentDashboard,

        canActivate: [roleGuard],

        data: {
          roles: ['STUDENT']
        }
      },

      // ------------------- ATTENDANCE --------------------

      {
        path: 'student/attendance',
        component: StudentAttendanceComponent,

        canActivate: [roleGuard],

        data: {
          roles: ['STUDENT'],
          title: 'My Attendance',
          description: 'View attendance records.'
        }
      }

    ]
  },

  // =======================================================
  // DEFAULT
  // =======================================================

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  // =======================================================
  // ERROR PAGES
  // =======================================================

  {
    path: 'not-found',
    component: NotFoundComponent
  },

  {
    path: 'server-error',
    component: ServerErrorComponent
  },

  // =======================================================
  // WILDCARD
  // =======================================================

  {
    path: '**',
    redirectTo: 'not-found'
  }

];