import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { PasswordManagementService } from './services/password-management.service';
import {
  PasswordManagementUser,
  PasswordResetResponse
} from './models/password-management.model';

@Component({
  selector: 'app-password-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './password-management.html',
  styleUrl: './password-management.scss'
})
export class PasswordManagementComponent implements OnInit {

  private readonly passwordManagementService =
    inject(PasswordManagementService);

  private readonly cdr =
    inject(ChangeDetectorRef);

  /* STATE */

  users: PasswordManagementUser[] = [];

  searchTerm = '';

onSearchChange(): void {
  this.currentPage = 1;
  this.visiblePasswordUserId = null;
}

  roleFilter: 'ALL' | 'STUDENT' | 'TEACHER' = 'ALL';

onRoleFilterChange(
  role: 'ALL' | 'STUDENT' | 'TEACHER'
): void {
  this.roleFilter = role;
  this.currentPage = 1;
  this.visiblePasswordUserId = null;
}

  /* PAGINATION */

currentPage = 1;
pageSize = 10;

get totalPages(): number {
  return Math.max(
    1,
    Math.ceil(this.filteredUsers.length / this.pageSize)
  );
}

get paginatedUsers(): PasswordManagementUser[] {
  const startIndex =
    (this.currentPage - 1) * this.pageSize;

  return this.filteredUsers.slice(
    startIndex,
    startIndex + this.pageSize
  );
}

get paginationStart(): number {
  if (this.filteredUsers.length === 0) {
    return 0;
  }

  return (this.currentPage - 1) * this.pageSize + 1;
}

get paginationEnd(): number {
  return Math.min(
    this.currentPage * this.pageSize,
    this.filteredUsers.length
  );
}

get pageNumbers(): number[] {
  return Array.from(
    { length: this.totalPages },
    (_, index) => index + 1
  );
}

goToPage(page: number): void {
  if (
    page < 1 ||
    page > this.totalPages ||
    page === this.currentPage
  ) {
    return;
  }

  this.currentPage = page;
  this.visiblePasswordUserId = null;
}

previousPage(): void {
  this.goToPage(this.currentPage - 1);
}

nextPage(): void {
  this.goToPage(this.currentPage + 1);
}

onPageSizeChange(): void {
  this.currentPage = 1;
  this.visiblePasswordUserId = null;
}

  loading = false;

  errorMessage = '';

  resettingUserId: number | null = null;

  /*
   * Temporary passwords exist only after an admin
   * performs a password reset.
   */
  temporaryPasswords = new Map<number, string>();

  /*
   * Controls which temporary password is currently visible.
   */
  visiblePasswordUserId: number | null = null;


  /* INIT */

  ngOnInit(): void {
    this.loadUsers();
  }


  /* LOAD USERS */

  loadUsers(): void {
    this.loading = true;
    this.errorMessage = '';

    this.passwordManagementService.getUsers().subscribe({
      next: (response) => {
        this.users = response.data ?? [];

        this.loading = false;

        this.cdr.markForCheck();
      },

      error: (error) => {
        console.error(error);

        this.errorMessage =
          error?.error?.message ||
          'Failed to load password management users.';

        this.loading = false;

        this.cdr.markForCheck();
      }
    });
  }


  /* FILTER */

  get filteredUsers(): PasswordManagementUser[] {
    const search = this.searchTerm
      .trim()
      .toLowerCase();

    return this.users.filter(user => {

      const matchesSearch =
        !search ||
        user.name.toLowerCase().includes(search) ||
        user.username.toLowerCase().includes(search);

      const matchesRole =
        this.roleFilter === 'ALL' ||
        user.role === this.roleFilter;

      return matchesSearch && matchesRole;
    });
  }


  /* PASSWORD */

  hasTemporaryPassword(userId: number): boolean {
    return this.temporaryPasswords.has(userId);
  }


  getTemporaryPassword(userId: number): string | null {
    return this.temporaryPasswords.get(userId) ?? null;
  }


  isPasswordVisible(userId: number): boolean {
    return this.visiblePasswordUserId === userId;
  }


  togglePassword(userId: number): void {
    if (!this.hasTemporaryPassword(userId)) {
      return;
    }

    this.visiblePasswordUserId =
      this.visiblePasswordUserId === userId
        ? null
        : userId;
  }


  /* RESET PASSWORD */

  resetPassword(user: PasswordManagementUser): void {

    if (this.resettingUserId !== null) {
      return;
    }

    this.resettingUserId = user.userId;

    this.errorMessage = '';

    this.passwordManagementService
      .resetPassword(user.userId)
      .subscribe({

        next: (response) => {

          const result: PasswordResetResponse =
            response.data;

          this.temporaryPasswords.set(
            result.userId,
            result.temporaryPassword
          );

          /*
           * Keep the newly generated password hidden
           * until the admin clicks the eye button.
           */
          this.visiblePasswordUserId = null;

          this.resettingUserId = null;

          this.cdr.markForCheck();
        },

        error: (error) => {

          console.error(error);

          this.errorMessage =
            error?.error?.message ||
            'Failed to reset password.';

          this.resettingUserId = null;

          this.cdr.markForCheck();
        }
      });
  }


  /* HELPERS */

  getRoleLabel(role: PasswordManagementUser['role']): string {
    return role === 'STUDENT'
      ? 'Student'
      : 'Teacher';
  }
}