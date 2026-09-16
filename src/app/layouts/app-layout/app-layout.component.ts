import { Component } from '@angular/core';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet
} from '@angular/router';

import { ProfileComponent } from '../../features/profile/profile/profile';

import { TokenService } from '../../core/auth/token.service';

interface NavigationItem {
  label: string;
  route: string;
  icon: string;
}

interface NavigationSection {
  title: string;
  items: NavigationItem[];
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    ProfileComponent
  ],
  templateUrl: './app-layout.component.html',
  styleUrl: './app-layout.component.scss'
})
export class AppLayoutComponent {

  sidebarOpen = false;
  profileOpen = false;

  userName = 'User';
  userRole = 'User';
  userInitial = 'U';

  navigationSections: NavigationSection[] = [];

  constructor(
    private readonly tokenService: TokenService,
    private readonly router: Router
  ) {
    this.loadUserInformation();
    this.loadNavigation();
  }


  // =====================================================
  // USER INFORMATION
  // =====================================================

  private loadUserInformation(): void {

    const role = this.tokenService.getRole();

    if (!role) {
      return;
    }

    this.userRole = this.formatRole(role);

    this.userName = this.formatRole(role);

    this.userInitial = this.userName.charAt(0).toUpperCase();
  }


  // =====================================================
  // ROLE BASED NAVIGATION
  // =====================================================

  private loadNavigation(): void {

    const role = this.tokenService.getRole();

    if (!role) {
      this.navigationSections = [];
      return;
    }

    switch (role) {

      case 'SUPER_ADMIN':

        this.navigationSections = [
          {
            title: 'MAIN',
            items: [
              {
                label: 'Dashboard',
                route: '/super-admin/dashboard',
                icon: '⌂'
              }
            ]
          },

          {
            title: 'MANAGEMENT',
            items: [
              {
                label: 'Admins',
                route: '/super-admin/admins',
                icon: '♙'
              }
            ]
          }
        ];

        break;


      case 'ADMIN':

        this.navigationSections = [
          {
            title: 'MAIN',
            items: [
              {
                label: 'Dashboard',
                route: '/admin/dashboard',
                icon: '⌂'
              }
            ]
          },

          {
            title: 'INSIDER',
            items: [
              {
                label: 'Students Insider',
                route: '/admin/insider/students',
                icon: '◉'
              },
              {
                label: 'Fees Insider',
                route: '/admin/fees-insider',
                icon: '₹'
              }
            ]
          },



          {
            title: 'ACADEMIC',
            items: [
              {
                label: 'Academic Years',
                route: '/admin/academic-years',
                icon: '▦'
              },

              {
                label: 'Classes',
                route: '/admin/classes',
                icon: '▤'
              },

              {
                label: 'Subjects',
                route: '/admin/subjects',
                icon: '▤'
              }
            ]
          },

          {
            title: 'FEES',
            items: [
              {
                label: 'Fee Structures',
                route: '/admin/fees/fee-structures',
                icon: '₹'
              },
              {
                label: 'Student Fees',
                route: '/admin/fees/student-fees',
                icon: '₹'
              },
              {
                label: 'Receipt Settings',
                route: '/admin/fees/receipt-settings',
                icon: '₹'
              }
            ]
          },

          {
            title: 'MANAGEMENT',
            items: [
              {
                label: 'Teachers',
                route: '/admin/teachers',
                icon: '♙'
              },

              {

                label: 'Teacher Roles',
                route: '/admin/teacher-roles',
                icon: '♙'
              },

              {
                label: 'Teacher Role Assignments',
                route: '/admin/teacher-role-assignments',
                icon: '♙'
              },

              {
                label: 'Students',
                route: '/admin/students',
                icon: '♙'
              },

              {
                label: 'Assignments',
                route: '/admin/assignments',
                icon: '≡'
              },

              {
                label: 'Attendance',
                route: '/admin/attendance',
                icon: '✓'
              }
            ]
          }
        ];

        break;


      case 'TEACHER':

        this.navigationSections = [
          {
            title: 'MAIN',
            items: [
              {
                label: 'Dashboard',
                route: '/teacher/dashboard',
                icon: '⌂'
              }
            ]
          },

          {
            title: 'TEACHING',
            items: [
              {
                label: 'My Assignments',
                route: '/teacher/assignments',
                icon: '≡'
              },

              {
                label: 'Students',
                route: '/teacher/students',
                icon: '♙'
              },

              {
                label: 'Attendance',
                route: '/teacher/attendance',
                icon: '✓'
              }
            ]
          }
        ];

        break;


      case 'STUDENT':

        this.navigationSections = [
          {
            title: 'MAIN',
            items: [
              {
                label: 'Dashboard',
                route: '/student/dashboard',
                icon: '⌂'
              }
            ]
          },


          {
            title: 'MY ACCOUNT',
            items: [
 
              {
                label: 'Attendance',
                route: '/student/attendance',
                icon: '✓'
              },

              {
                label: 'Fees',
                route: '/student/fees',
                icon: '₹'
              },
            ]
          }
        ];

        break;


      default:

        this.navigationSections = [];

        break;
    }
  }


  // =====================================================
  // ROLE FORMATTER
  // =====================================================

  private formatRole(role: string): string {

    return role
      .toLowerCase()
      .replace(/_/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase());
  }


  // =====================================================
  // SIDEBAR
  // =====================================================

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }


  closeSidebar(): void {
    this.sidebarOpen = false;
  }


  // =====================================================
  // LOGOUT
  // =====================================================

  logout(): void {

    this.tokenService.removeToken();

    this.sidebarOpen = false;

    this.router.navigate(['/login']);
  }

  goToProfile(): void {
    this.sidebarOpen = false;
    this.profileOpen = true;
  }
}
