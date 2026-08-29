import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import {
  TeacherRoleAssignment,
  TeacherRoleScope
} from '../models/teacher-role-assignment.model';

import {
  TeacherRoleAssignmentService
} from '../services/teacher-role-assignment.service';


@Component({
  selector: 'app-teacher-role-assignment-list',

  standalone: true,

  imports: [
    CommonModule
  ],

  templateUrl:
    './teacher-role-assignment-list.html',

  styleUrl:
    './teacher-role-assignment-list.scss'
})
export class TeacherRoleAssignmentList
  implements OnInit {


  // =========================================================
  // SERVICES
  // =========================================================

  private readonly router =
    inject(Router);

  private readonly assignmentService =
    inject(TeacherRoleAssignmentService);

  private readonly cdr =
    inject(ChangeDetectorRef);


  // =========================================================
  // DATA
  // =========================================================

  assignments:
    TeacherRoleAssignment[] = [];


  // =========================================================
  // STATE
  // =========================================================

  loading = false;

  deleting = false;

  errorMessage = '';

  successMessage = '';


  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {

    this.loadAssignments();

  }


  // =========================================================
  // LOAD ASSIGNMENTS
  // =========================================================

  loadAssignments(): void {

    this.loading = true;

    this.errorMessage = '';

    this.successMessage = '';


    this.assignmentService
      .getAllAssignments()
      .subscribe({

        next: (response) => {

          this.assignments =
            response?.data ?? [];

          this.loading = false;
          this.cdr.detectChanges();

        },

        error: (error) => {

          console.error(
            'Failed to load teacher role assignments',
            error
          );

          this.errorMessage =
            error?.error?.message ??
            'Failed to load teacher role assignments.';

          this.loading = false;
          this.cdr.detectChanges();

        }

      });

  }


  // =========================================================
  // CREATE ASSIGNMENT
  // =========================================================

  createAssignment(): void {

    this.router.navigate([
      '/admin/teacher-role-assignments/create'
    ]);

  }

viewAssignment(teacherId: number): void {
  this.router.navigate([
    '/admin/teacher-role-assignments',
    teacherId,
    'view'
  ]);
}

editAssignment(teacherId: number): void {
  this.router.navigate([
    '/admin/teacher-role-assignments',
    teacherId,
    'edit'
  ]);
}


  // =========================================================
  // REMOVE ASSIGNMENT
  // =========================================================

  removeAssignment(
    teacherId: number
  ): void {

    if (this.deleting) {

      return;

    }


    const confirmed =
      window.confirm(
        'Are you sure you want to remove this teacher role assignment?'
      );


    if (!confirmed) {

      return;

    }


    this.deleting = true;

    this.errorMessage = '';

    this.successMessage = '';


    this.assignmentService
      .removeAssignment(teacherId)
      .subscribe({

        next: (response) => {

          this.deleting = false;

          this.successMessage =
            response?.message ??
            'Teacher role assignment removed successfully.';


          this.loadAssignments();

        },

        error: (error) => {

          console.error(
            'Failed to remove teacher role assignment',
            error
          );


          this.errorMessage =
            error?.error?.message ??
            'Failed to remove teacher role assignment.';


          this.deleting = false;

        }

      });

  }


  // =========================================================
  // GET SCOPE DISPLAY
  // =========================================================

  getScopeCount(
    assignment: TeacherRoleAssignment
  ): number {

    return assignment.scopes?.length ?? 0;

  }


  // =========================================================
  // FORMAT SCOPE
  // =========================================================

  formatScope(
    scope: TeacherRoleScope
  ): string {

    const year =
      scope.academicYearName ??
      `Year #${scope.academicYearId}`;


    const className =
      scope.className ??
      `Class #${scope.classId}`;


    const section =
      scope.sectionName ??
      'All Sections';


    return `${year} • ${className} • ${section}`;

  }


  // =========================================================
  // TRACK BY
  // =========================================================

  trackByAssignment(
    index: number,
    assignment: TeacherRoleAssignment
  ): number {

    return assignment.id;

  }


  // =========================================================
  // RETRY
  // =========================================================

  retry(): void {

    this.loadAssignments();

  }

}
