import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject
} from '@angular/core';
import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  TeacherRoleAssignment
} from '../models/teacher-role-assignment.model';

import {
  TeacherRoleAssignmentService
} from '../services/teacher-role-assignment.service';

@Component({
  selector: 'app-teacher-role-assignment-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './teacher-role-assignment-view.html',
  styleUrl: './teacher-role-assignment-view.scss'
})
export class TeacherRoleAssignmentView implements OnInit {

  // =========================================================
  // SERVICES
  // =========================================================

  private readonly route = inject(ActivatedRoute);

  private readonly router = inject(Router);

  private readonly assignmentService =
    inject(TeacherRoleAssignmentService);

  private readonly cdr =
    inject(ChangeDetectorRef);


  // =========================================================
  // DATA
  // =========================================================

  assignment: TeacherRoleAssignment | null = null;


  // =========================================================
  // STATE
  // =========================================================

  loading = false;

  errorMessage = '';


  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {

    const teacherId =
      Number(
        this.route.snapshot.paramMap.get('teacherId')
      );

    if (!teacherId) {

      this.errorMessage =
        'Invalid teacher ID.';

      return;
    }

    this.loadAssignment(teacherId);
  }


  // =========================================================
  // LOAD ASSIGNMENT
  // =========================================================

  loadAssignment(teacherId: number): void {

    this.loading = true;

    this.errorMessage = '';

    this.assignmentService
      .getAssignmentByTeacherId(teacherId)
      .subscribe({

        next: (response) => {

          this.assignment =
            response?.data ?? null;

          this.loading = false;

          this.cdr.detectChanges();
        },


        error: (error) => {

          console.error(
            'Failed to load teacher role assignment',
            error
          );

          this.errorMessage =
            error?.error?.message ??
            'Failed to load teacher role assignment.';

          this.loading = false;

          this.cdr.detectChanges();
        }

      });
  }


  // =========================================================
  // EDIT
  // =========================================================

  editAssignment(): void {

    if (!this.assignment) {
      return;
    }

    this.router.navigate([
      '/admin/teacher-role-assignments',
      this.assignment.teacherId,
      'edit'
    ]);
  }


  // =========================================================
  // BACK
  // =========================================================

  goBack(): void {

    this.router.navigate([
      '/admin/teacher-role-assignments'
    ]);
  }


  // =========================================================
  // RETRY
  // =========================================================

  retry(): void {

    if (!this.assignment) {

      const teacherId =
        Number(
          this.route.snapshot.paramMap.get('teacherId')
        );

      if (teacherId) {
        this.loadAssignment(teacherId);
      }

      return;
    }

    this.loadAssignment(
      this.assignment.teacherId
    );
  }


  // =========================================================
  // SCOPE COUNT
  // =========================================================

  getScopeCount(): number {

    return this.assignment?.scopes?.length ?? 0;
  }


  // =========================================================
  // FORMAT DATE
  // =========================================================

  formatDate(date: string): string {

    if (!date) {
      return '-';
    }

    return new Date(date).toLocaleString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }
    );
  }

}