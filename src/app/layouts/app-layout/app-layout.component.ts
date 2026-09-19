import { Component } from '@angular/core';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet
} from '@angular/router';

import { ProfileComponent } from '../../features/profile/profile/profile';

import { TokenService } from '../../core/auth/token.service';
import { AuthStateService } from '../../core/auth/auth-state.service';

import {
  NAVIGATION_CONFIG,
  NavigationSection
} from '../../core/navigation/navigation.config';

import { GlobalSearchComponent } from '../../shared/components/global-search/global-search.component';



@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    ProfileComponent,
    GlobalSearchComponent
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
    private readonly router: Router,
    private readonly authStateService: AuthStateService,
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

  this.navigationSections = NAVIGATION_CONFIG[role] ?? [];
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

  this.authStateService.logout().subscribe({
    next: () => {
      this.sidebarOpen = false;
      this.router.navigate(['/login']);
    },

    error: error => {
      console.error('Logout failed:', error);

      this.sidebarOpen = false;
      this.router.navigate(['/login']);
    }
  });
}

  goToProfile(): void {
    this.sidebarOpen = false;
    this.profileOpen = true;
  }
}
