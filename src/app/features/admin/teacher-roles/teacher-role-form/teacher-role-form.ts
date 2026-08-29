import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { TeacherRoleService } from '../services/teacher-role.service';
import { PermissionService } from '../services/permission.service';
import { Permission } from '../models/permission.model';

@Component({
  selector: 'app-teacher-role-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './teacher-role-form.html',
  styleUrl: './teacher-role-form.scss'
})
export class TeacherRoleForm implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private readonly teacherRoleService = inject(TeacherRoleService);
  private readonly permissionService = inject(PermissionService);
  private readonly cdr = inject(ChangeDetectorRef);

  permissions: Permission[] = [];

  loading = false;
  submitting = false;
  errorMessage = '';

  roleId: number | null = null;

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', [Validators.maxLength(255)]],
    permissionIds: this.fb.nonNullable.control<number[]>([])
  });

  get isEditMode(): boolean {
    return this.roleId !== null;
  }

  ngOnInit(): void {
    this.roleId = Number(this.route.snapshot.paramMap.get('id')) || null;

    this.loadPermissions();

    if (this.roleId) {
      this.loadRole(this.roleId);
    }
  }

  loadPermissions(): void {
    this.permissionService.getPermissions().subscribe({
      next: (response) => {
        this.permissions = response.data ?? [];
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Failed to load permissions', error);
        this.errorMessage =
          error?.error?.message ??
          'Failed to load permissions.';
        this.cdr.detectChanges();
      }
    });
  }

  loadRole(id: number): void {
    this.loading = true;
    this.errorMessage = '';

    this.teacherRoleService.getRoleById(id).subscribe({
      next: (response) => {
        const role = response.data;

        this.form.patchValue({
          name: role.name,
          description: role.description ?? '',
          permissionIds: role.permissions.map(permission => permission.id)
        });

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Failed to load teacher role', error);

        this.errorMessage =
          error?.error?.message ??
          'Failed to load teacher role.';

        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  togglePermission(permissionId: number): void {
    const current = this.form.controls.permissionIds.value;

    if (current.includes(permissionId)) {
      this.form.controls.permissionIds.setValue(
        current.filter(id => id !== permissionId)
      );
    } else {
      this.form.controls.permissionIds.setValue([
        ...current,
        permissionId
      ]);
    }
  }

  isPermissionSelected(permissionId: number): boolean {
    return this.form.controls.permissionIds.value.includes(permissionId);
  }

  submit(): void {
    if (this.form.invalid || this.submitting) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.errorMessage = '';

    const request = {
      name: this.form.controls.name.value.trim(),
      description: this.form.controls.description.value.trim(),
      permissionIds: this.form.controls.permissionIds.value
    };

    if (this.isEditMode && this.roleId) {
      this.teacherRoleService
        .updateRole(this.roleId, request)
        .subscribe({
          next: () => {
            this.router.navigate(['/admin/teacher-roles']);
          },
          error: (error) => {
            console.error('Failed to update teacher role', error);

            this.errorMessage =
              error?.error?.message ??
              'Failed to update teacher role.';

            this.submitting = false;
          }
        });

      return;
    }

    this.teacherRoleService
      .createRole(request)
      .subscribe({
        next: () => {
          this.router.navigate(['/admin/teacher-roles']);
        },
        error: (error) => {
          console.error('Failed to create teacher role', error);

          this.errorMessage =
            error?.error?.message ??
            'Failed to create teacher role.';

          this.submitting = false;
        }
      });
  }

  cancel(): void {
    if (this.submitting) {
      return;
    }

    this.router.navigate(['/admin/teacher-roles']);
  }
}
