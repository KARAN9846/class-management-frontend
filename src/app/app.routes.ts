import { Routes } from '@angular/router';

import { LoginComponent } from './features/auth/login/login.component';
import { AppLayoutComponent } from './layouts/app-layout/app-layout.component';

import { AccessDeniedComponent } from './features/errors/access-denied/access-denied.component';
import { NotFoundComponent } from './features/errors/not-found/not-found.component';
import { ServerErrorComponent } from './features/errors/server-error/server-error.component';

import { SuperAdminDashboard } from './features/super-admin/dashboard/super-admin-dashboard/super-admin-dashboard';
import { AdminDashboard } from './features/admin/dashboard/admin-dashboard/admin-dashboard';
import { TeacherDashboard } from './features/teacher/dashboard/teacher-dashboard/teacher-dashboard';
import { StudentDashboard } from './features/student/dashboard/student-dashboard/student-dashboard';

import { PagePlaceholderComponent } from './shared/components/page-placeholder/page-placeholder.component';

import { AcademicYearsComponent } from './features/admin/academic/academic-years/academic-years';
import { ClassesComponent } from './features/admin/academic/classes/classes';
import { SubjectsComponent } from './features/admin/academic/subjects/subjects';

import { TeacherList } from './features/admin/teachers/teacher-list/teacher-list';
import { TeacherDetails } from './features/admin/teachers/teacher-details/teacher-details';
import { TeacherForm } from './features/admin/teachers/teacher-form/teacher-form';

import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';


export const routes: Routes = [

{
path:'login',
component:LoginComponent
},

{
path:'access-denied',
component:AccessDeniedComponent
},


{
path:'',
component:AppLayoutComponent,
canActivate:[authGuard],

children:[

// ================= SUPER ADMIN =================

{
path:'super-admin/dashboard',
component:SuperAdminDashboard,
canActivate:[roleGuard],
data:{roles:['SUPER_ADMIN']}
},

{
path:'super-admin/admins',
component:PagePlaceholderComponent,
canActivate:[roleGuard],
data:{
roles:['SUPER_ADMIN'],
title:'Admin Management',
description:'Manage system administrators.'
}
},


// ================= ADMIN =================

{
path:'admin/dashboard',
component:AdminDashboard,
canActivate:[roleGuard],
data:{roles:['ADMIN']}
},

{
path:'admin/academic-years',
component:AcademicYearsComponent,
canActivate:[roleGuard],
data:{roles:['ADMIN']}
},

{
path:'admin/classes',
component:ClassesComponent,
canActivate:[roleGuard],
data:{roles:['ADMIN']}
},

{
path:'admin/subjects',
component:SubjectsComponent,
canActivate:[roleGuard],
data:{roles:['ADMIN']}
},


// ================= TEACHERS =================

{
path:'admin/teachers/create',
component:TeacherForm,
canActivate:[roleGuard],
data:{roles:['ADMIN']}
},

{
path:'admin/teachers/:id/edit',
component:TeacherForm,
canActivate:[roleGuard],
data:{roles:['ADMIN']}
},

{
path:'admin/teachers/:id',
component:TeacherDetails,
canActivate:[roleGuard],
data:{roles:['ADMIN']}
},

{
path:'admin/teachers',
component:TeacherList,
canActivate:[roleGuard],
data:{roles:['ADMIN']}
},


// ================= STUDENTS =================

{
path:'admin/students',
component:PagePlaceholderComponent,
canActivate:[roleGuard],
data:{
roles:['ADMIN'],
title:'Students',
description:'Manage students.'
}
},

{
path:'admin/assignments',
component:PagePlaceholderComponent,
canActivate:[roleGuard],
data:{
roles:['ADMIN'],
title:'Teacher Assignments',
description:'Manage teacher assignments.'
}
},

{
path:'admin/attendance',
component:PagePlaceholderComponent,
canActivate:[roleGuard],
data:{
roles:['ADMIN'],
title:'Attendance',
description:'Manage attendance.'
}
},


// ================= TEACHER =================

{
path:'teacher/dashboard',
component:TeacherDashboard,
canActivate:[roleGuard],
data:{roles:['TEACHER']}
},


// ================= STUDENT =================

{
path:'student/dashboard',
component:StudentDashboard,
canActivate:[roleGuard],
data:{roles:['STUDENT']}
},

{
path:'student/attendance',
component:PagePlaceholderComponent,
canActivate:[roleGuard],
data:{
roles:['STUDENT'],
title:'My Attendance',
description:'View attendance records.'
}
}

]

},


// ================= DEFAULT =================

{
path:'',
redirectTo:'login',
pathMatch:'full'
},


// ================= ERRORS =================

{
path:'not-found',
component:NotFoundComponent
},

{
path:'server-error',
component:ServerErrorComponent
},

{
path:'**',
redirectTo:'not-found'
}

];