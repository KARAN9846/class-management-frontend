import { Routes } from '@angular/router';

import { LoginComponent } from './features/auth/login/login.component';

import { AppLayoutComponent } from './layouts/app-layout/app-layout.component';
import { ServerErrorComponent } from './features/errors/server-error/server-error.component';
import { SuperAdminDashboard } from './features/super-admin/dashboard/super-admin-dashboard/super-admin-dashboard';
import { AdminDashboard } from './features/admin/dashboard/admin-dashboard/admin-dashboard';
import { TeacherDashboard } from './features/teacher/dashboard/teacher-dashboard/teacher-dashboard';
import { StudentDashboard } from './features/student/dashboard/student-dashboard/student-dashboard';
import { NotFoundComponent } from './features/errors/not-found/not-found.component';
import { PagePlaceholderComponent } from './shared/components/page-placeholder/page-placeholder.component';
import { AccessDeniedComponent } from './features/errors/access-denied/access-denied.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { AcademicYearsComponent } from './features/admin/academic/academic-years/academic-years';
import { ClassesComponent } from './features/admin/academic/classes/classes';
import { SubjectsComponent } from './features/admin/academic/subjects/subjects';

export const routes: Routes = [

  // =====================================================
  // LOGIN
  // =====================================================

  {
    path: 'login',
    component: LoginComponent
  },

    {

    path: 'access-denied',

    component: AccessDeniedComponent

  },


  // =====================================================
  // APPLICATION LAYOUT
  // =====================================================

  {
    path: '',
    component: AppLayoutComponent,
    canActivate: [authGuard],

    children: [

      // =================================================
      // SUPER ADMIN
      // =================================================

      {
        path: 'super-admin/dashboard',
        component: SuperAdminDashboard,

        canActivate: [roleGuard],

        data: {
          roles: ['SUPER_ADMIN']
        }
      },

      {
        path: 'super-admin/admins',
        component: PagePlaceholderComponent,

        canActivate: [roleGuard],

        data: {
          roles: ['SUPER_ADMIN'],
          title: 'Admin Management',
          description: 'Manage system administrators.'
        }
      },


      // =================================================
      // ADMIN
      // =================================================

      {
        path: 'admin/dashboard',
        component: AdminDashboard,

        canActivate: [roleGuard],

        data: {
          roles: ['ADMIN']
        }
      },

      {
        path: 'admin/academic-years',
        component: AcademicYearsComponent,

        canActivate: [roleGuard],

        data: {
          roles: ['ADMIN'],
          title: 'Academic Years',
          description: 'Manage academic years and sessions.'
        }
      },

      {
        path: 'admin/classes',
        component: ClassesComponent,

        canActivate: [roleGuard],

        data: {
          roles: ['ADMIN'],
          title: 'Classes',
          description: 'Manage classes.'
        }
      },

      {
        path: 'admin/subjects',
        component: SubjectsComponent,

        canActivate: [roleGuard],

        data: {
          roles: ['ADMIN'],
          title: 'Subjects',
          description: 'Manage subjects.'
        }
      },

      {
        path: 'admin/teachers',
        component: PagePlaceholderComponent,

        canActivate: [roleGuard],

        data: {
          roles: ['ADMIN'],
          title: 'Teachers',
          description: 'Manage teachers.'
        }
      },

      {
        path: 'admin/students',
        component: PagePlaceholderComponent,

        canActivate: [roleGuard],

        data: {
          roles: ['ADMIN'],
          title: 'Students',
          description: 'Manage students.'
        }
      },

      {
        path: 'admin/assignments',
        component: PagePlaceholderComponent,

        canActivate: [roleGuard],

        data: {
          roles: ['ADMIN'],
          title: 'Teacher Assignments',
          description: 'Manage teacher assignments.'
        }
      },

      {
        path: 'admin/attendance',
        component: PagePlaceholderComponent,

        canActivate: [roleGuard],

        data: {
          roles: ['ADMIN'],
          title: 'Attendance',
          description: 'Manage and monitor attendance.'
        }
      },


      // =================================================
      // TEACHER
      // =================================================

      {
        path: 'teacher/dashboard',
        component: TeacherDashboard,

        canActivate: [roleGuard],

        data: {
          roles: ['TEACHER']
        }
      },

      {
        path: 'teacher/assignments',
        component: PagePlaceholderComponent,

        canActivate: [roleGuard],

        data: {
          roles: ['TEACHER'],
          title: 'My Assignments',
          description: 'View your assigned classes and subjects.'
        }
      },

      {
        path: 'teacher/students',
        component: PagePlaceholderComponent,

        canActivate: [roleGuard],

        data: {
          roles: ['TEACHER'],
          title: 'Students',
          description: 'View your assigned students.'
        }
      },

      {
        path: 'teacher/attendance',
        component: PagePlaceholderComponent,

        canActivate: [roleGuard],

        data: {
          roles: ['TEACHER'],
          title: 'Attendance',
          description: 'Mark and manage student attendance.'
        }
      },


      // =================================================
      // STUDENT
      // =================================================

      {
        path: 'student/dashboard',
        component: StudentDashboard,

        canActivate: [roleGuard],

        data: {
          roles: ['STUDENT']
        }
      },

      {
        path: 'student/profile',
        component: PagePlaceholderComponent,

        canActivate: [roleGuard],

        data: {
          roles: ['STUDENT'],
          title: 'My Profile',
          description: 'View and manage your profile.'
        }
      },

      {
        path: 'student/attendance',
        component: PagePlaceholderComponent,

        canActivate: [roleGuard],

        data: {
          roles: ['STUDENT'],
          title: 'My Attendance',
          description: 'View your attendance records.'
        }
      }

    ]
  },


  // =====================================================
  // DEFAULT ROUTE
  // =====================================================

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },


  // =====================================================
  // 404 / UNKNOWN ROUTE
  // =====================================================

  {
  path: 'not-found',
  component: NotFoundComponent
},
{
  path: 'server-error',
  component: ServerErrorComponent
},
{
  path: '**',
  redirectTo: 'not-found'
}

];
