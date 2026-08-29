import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import {
  DataTableComponent,
  TableAction,
  TableColumn
} from '../../../../shared/components/data-table/data-table.component';

import { TeacherRole } from '../models/teacher-role.model';
import { TeacherRoleService } from '../services/teacher-role.service';

@Component({
  selector: 'app-teacher-role-list',
  standalone: true,
  imports: [
    DataTableComponent
  ],
  templateUrl: './teacher-role-list.html',
  styleUrl: './teacher-role-list.scss'
})
export class TeacherRoleList implements OnInit {

  private readonly teacherRoleService = inject(TeacherRoleService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  roles: TeacherRole[] = [];

  loading = false;
  errorMessage = '';

  showDeactivateConfirm = false;
  selectedRole: TeacherRole | null = null;
  deactivating = false;

  columns: TableColumn[] = [
    {
      key: 'name',
      label: 'Role Name',
      width: '20%'
    },
    {
      key: 'description',
      label: 'Description',
      width: '30%'
    },
    {
      key: 'permissions',
      label: 'Permissions',
      width: '25%',
      type: 'permissions'
    },
    {
      key: 'isActive',
      label: 'Status',
      width: '12%',
      type: 'status',
      align: 'center'
    },
    {
      key: 'createdAt',
      label: 'Created',
      width: '13%',
      type: 'date-time'
    }
  ];

  actions: TableAction[] = [
    {
      label: 'Edit',
      type: 'edit',
      
    },
    {
      label: 'Deactivate',
      type: 'deactivate',
      
      danger: true
    }
  ];

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {

    this.loading = true;
    this.errorMessage = '';

    this.teacherRoleService.getRoles().subscribe({

      next: (response) => {

        this.roles = response.data ?? [];

        this.loading = false;
        this.cdr.detectChanges();
      },

      error: (error) => {

        console.error(
          'Failed to load teacher roles',
          error
        );

        this.errorMessage =
          error?.error?.message ??
          'Failed to load teacher roles. Please try again.';

        this.loading = false;
        this.cdr.detectChanges();
      }

    });
  }

  createRole(): void {

    this.router.navigate([
      '/admin/teacher-roles/create'
    ]);

  }

  onActionClick(event: {
    action: TableAction;
    row: TeacherRole;
  }): void {

    const { action, row } = event;

    switch (action.type) {

      case 'edit':
        this.editRole(row);
        break;

      case 'deactivate':
        this.openDeactivateConfirm(row);
        break;

    }
  }

  editRole(role: TeacherRole): void {

    this.router.navigate([
      '/admin/teacher-roles',
      role.id,
      'edit'
    ]);

  }

  openDeactivateConfirm(
    role: TeacherRole
  ): void {

    this.selectedRole = role;
    this.showDeactivateConfirm = true;

  }

  cancelDeactivate(): void {

    if (this.deactivating) {
      return;
    }

    this.showDeactivateConfirm = false;
    this.selectedRole = null;

  }

  confirmDeactivate(): void {

    if (
      !this.selectedRole ||
      this.deactivating
    ) {
      return;
    }

    this.deactivating = true;

    const roleId = this.selectedRole.id;

    this.teacherRoleService
      .deactivateRole(roleId)
      .subscribe({

        next: () => {

          this.deactivating = false;

          this.showDeactivateConfirm = false;
          this.selectedRole = null;

          this.loadRoles();

        },

        error: (error) => {

          console.error(
            'Failed to deactivate teacher role',
            error
          );

          this.deactivating = false;

          this.errorMessage =
            error?.error?.message ??
            'Failed to deactivate teacher role.';

        }

      });
  }
}
