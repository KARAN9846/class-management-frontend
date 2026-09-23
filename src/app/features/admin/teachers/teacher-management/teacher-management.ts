import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { TeacherList } from '../teacher-list/teacher-list';

@Component({
  selector: 'app-teacher-management',
  standalone: true,
  imports: [TeacherList],
  templateUrl: './teacher-management.html',
  styleUrl: './teacher-management.scss'
})
export class TeacherManagementComponent {

  constructor(
    private readonly router: Router
  ) {}

  openTeacherRoles(): void {
    this.router.navigate(['/admin/teacher-roles']);
  }

  openRoleAssignments(): void {
    this.router.navigate(['/admin/teacher-role-assignments']);
  }

  openTeacherAssignments(): void {
    this.router.navigate(['/admin/teacher-assignments']);
  }
}