import { CommonModule } from '@angular/common';
import {
  Component,
  ChangeDetectorRef,
  OnInit,
  inject
} from '@angular/core';
import {
  ActivatedRoute,
  Router
} from '@angular/router';

import { TeacherService } from '../services/teacher.service';
import { Teacher } from '../models/teacher.model';

import {
  TeacherRoleAssignment
} from '../../teacher-role-assignments/models/teacher-role-assignment.model';

import {
  TeacherRoleAssignmentService
} from '../../teacher-role-assignments/services/teacher-role-assignment.service';

import { TeacherRoleService } from '../../teacher-roles/services/teacher-role.service';
import { TeacherRole } from '../../teacher-roles/models/teacher-role.model';

@Component({
  selector: 'app-teacher-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './teacher-details.html',
  styleUrl: './teacher-details.scss'
})
export class TeacherDetails implements OnInit {

  // =========================================================
  // SERVICES
  // =========================================================

  private readonly route = inject(ActivatedRoute);

  private readonly router = inject(Router);

  private readonly teacherService =
    inject(TeacherService);

  private readonly assignmentService =
    inject(TeacherRoleAssignmentService);

  private readonly teacherRoleService =
    inject(TeacherRoleService);

  private readonly cdr =
    inject(ChangeDetectorRef);


  // =========================================================
  // DATA
  // =========================================================

  teacher: Teacher | null = null;

  assignment: TeacherRoleAssignment | null = null;

  role: TeacherRole | null = null;


  // =========================================================
  // STATE
  // =========================================================

  loading = false;

  loadingAssignment = false;

  loadingRole = false;

  errorMessage = '';

  assignmentErrorMessage = '';


  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {

    const id =
      Number(
        this.route.snapshot.paramMap.get('id')
      );

    if (!id) {

      this.errorMessage =
        'Invalid teacher ID.';

      return;
    }

    this.loadTeacher(id);

    this.loadAssignment(id);
  }


  // =========================================================
  // LOAD TEACHER
  // =========================================================

  loadTeacher(id: number): void {

    this.loading = true;

    this.errorMessage = '';

    this.teacherService
      .getTeacherById(id)
      .subscribe({

        next: (response: any) => {

          this.teacher =
            response?.data ?? null;

          this.loading = false;

          this.cdr.detectChanges();
        },

        error: (error) => {

          console.error(
            'Failed to load teacher details',
            error
          );

          this.teacher = null;

          this.errorMessage =
            error?.error?.message ??
            'Failed to load teacher details.';

          this.loading = false;

          this.cdr.detectChanges();
        }

      });
  }


  // =========================================================
  // LOAD ROLE ASSIGNMENT
  // =========================================================

  loadAssignment(
    teacherId: number
  ): void {

    this.loadingAssignment = true;

    this.assignmentErrorMessage = '';

    this.assignmentService
      .getAssignmentByTeacherId(teacherId)
      .subscribe({

        next: (response) => {

          this.assignment =
            response?.data ?? null;

          this.loadingAssignment = false;

          // Load role + permissions
          if (this.assignment) {

            this.loadRole(
              this.assignment.teacherRoleId
            );

          } else {

            this.role = null;
          }

          this.cdr.detectChanges();
        },

        error: (error) => {

          console.error(
            'Failed to load teacher role assignment',
            error
          );

          this.assignment = null;

          this.role = null;

          this.loadingAssignment = false;

          this.assignmentErrorMessage =
            error?.error?.message ??
            'No additional teacher role is assigned.';

          this.cdr.detectChanges();
        }

      });
  }


  // =========================================================
  // LOAD ROLE + PERMISSIONS
  // =========================================================

  loadRole(
    roleId: number
  ): void {

    this.loadingRole = true;

    this.teacherRoleService
      .getRoleById(roleId)
      .subscribe({

        next: (response) => {

          this.role =
            response?.data ?? null;

          this.loadingRole = false;

          this.cdr.detectChanges();
        },

        error: (error) => {

          console.error(
            'Failed to load teacher role',
            error
          );

          this.role = null;

          this.loadingRole = false;

          this.cdr.detectChanges();
        }

      });
  }


  // =========================================================
  // EDIT TEACHER
  // =========================================================

  editTeacher(): void {

    if (!this.teacher) {
      return;
    }

    this.router.navigate([
      '/admin/teachers',
      this.teacher.id,
      'edit'
    ]);
  }


  // =========================================================
  // BACK
  // =========================================================

  goBack(): void {

    this.router.navigate([
      '/admin/teachers'
    ]);
  }

}