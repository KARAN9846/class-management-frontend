import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import { TeacherService } from '../services/teacher.service';
import { Teacher } from '../models/teacher.model';
import { Router } from '@angular/router';

import {
  DataTableComponent,
  TableColumn,
  TableAction
} from '../../../../shared/components/data-table/data-table.component';

import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { SearchInputComponent } from '../../../../shared/components/search-input/search-input.component';

@Component({
  selector: 'app-teacher-list',
  standalone: true,
  imports: [
    CommonModule,
    DataTableComponent,
    PaginationComponent,
    SearchInputComponent
  ],
  templateUrl: './teacher-list.html',
  styleUrl: './teacher-list.scss'
})
export class TeacherList implements OnInit {

  // =========================================================
  // SERVICES
  // =========================================================

  readonly router = inject(Router);

  private readonly teacherService =
    inject(TeacherService);

  private readonly cdr =
    inject(ChangeDetectorRef);


  // =========================================================
  // STATUS MODAL
  // =========================================================

  showStatusConfirm = false;

  selectedTeacher: Teacher | null = null;

  statusChanging = false;


  // =========================================================
  // DELETE MODAL
  // =========================================================

  showDeleteConfirm = false;

  selectedDeleteTeacher: Teacher | null = null;

  deleting = false;


  // =========================================================
  // DATA
  // =========================================================

  teachers: Teacher[] = [];

  loading = false;

  search = '';

  page = 0;

  size = 10;

  totalElements = 0;


  // =========================================================
  // MESSAGES
  // =========================================================

  errorMessage = '';

  successMessage = '';


  // =========================================================
  // TABLE COLUMNS
  // =========================================================

  columns: TableColumn[] = [

    {
      key: 'teacherNumber',
      label: 'Teacher No.'
    },

    {
      key: 'firstName',
      label: 'First Name'
    },

    {
      key: 'lastName',
      label: 'Last Name'
    },

    {
      key: 'email',
      label: 'Email'
    },

    {
      key: 'phone',
      label: 'Phone'
    },

    {
      key: 'isActive',
      label: 'Status',
      type: 'status'
    }

  ];


  // =========================================================
  // TABLE ACTIONS
  // =========================================================

  actions: TableAction[] = [

    {
      label: 'Edit',
      type: 'edit'
    },

    {
      label: 'Status',
      type: 'status'
    },

    {
      label: 'Delete',
      type: 'delete',
      danger: true
    }

  ];


  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {

    this.loadTeachers();

  }


  // =========================================================
  // LOAD TEACHERS
  // =========================================================

  loadTeachers(): void {

    this.loading = true;

    this.errorMessage = '';

    this.successMessage = '';

    this.cdr.detectChanges();


    this.teacherService
      .getTeachers(
        this.page,
        this.size,
        this.search
      )
      .subscribe({

        next: (response) => {

          this.teachers =
            response.data.content;

          this.totalElements =
            response.data.totalElements;

          this.loading = false;

          this.cdr.detectChanges();

        },

        error: (error) => {

          console.error(
            'Failed to load teachers:',
            error
          );

          this.loading = false;

          this.errorMessage =
            error?.error?.message ||
            'Failed to load teachers.';

          this.cdr.detectChanges();

        }

      });

  }


  // =========================================================
  // SEARCH
  // =========================================================

  onSearch(value: string): void {

    this.search = value;

    this.page = 0;

    this.loadTeachers();

  }


  // =========================================================
  // PAGINATION
  // =========================================================

  onPageChange(page: number): void {

    this.page = page - 1;

    this.loadTeachers();

  }


  // =========================================================
  // TABLE ACTION
  // =========================================================

  onAction(event: any): void {

    const teacher =
      event.row as Teacher;

    const id =
      Number(teacher.id);


    switch (event.action.type) {


      // -----------------------------------------------------
      // EDIT
      // -----------------------------------------------------

      case 'edit':

        this.router.navigate([
          '/admin/teachers',
          id,
          'edit'
        ]);

        break;


      // -----------------------------------------------------
      // STATUS
      // -----------------------------------------------------

      case 'status':

        this.toggleStatus(teacher);

        break;


      // -----------------------------------------------------
      // DELETE
      // -----------------------------------------------------

      case 'delete':

        this.deleteTeacher(teacher);

        break;

    }

  }


  // =========================================================
  // STATUS
  // =========================================================

  toggleStatus(
    teacher: Teacher
  ): void {

    this.selectedTeacher = teacher;

    this.showStatusConfirm = true;

  }


  confirmStatusChange(): void {

    if (!this.selectedTeacher) {

      return;

    }


    const teacher =
      this.selectedTeacher;

    const newStatus =
      !teacher.isActive;


    this.statusChanging = true;

    this.errorMessage = '';

    this.successMessage = '';


    this.teacherService
      .updateStatus(
        teacher.id,
        newStatus
      )
      .subscribe({

        next: (response) => {

          teacher.isActive =
            response.data.isActive;

          this.statusChanging = false;

          this.showStatusConfirm = false;

          this.selectedTeacher = null;

          this.successMessage =
            teacher.isActive
              ? 'Teacher activated successfully.'
              : 'Teacher deactivated successfully.';

          this.cdr.detectChanges();


          setTimeout(() => {

            this.successMessage = '';

            this.cdr.detectChanges();

          }, 2500);

        },


        error: (error) => {

          console.error(
            'Failed to update teacher status:',
            error
          );

          this.statusChanging = false;

          this.showStatusConfirm = false;

          this.selectedTeacher = null;

          this.errorMessage =
            this.getBackendErrorMessage(
              error,
              'Failed to update teacher status.'
            );

          this.cdr.detectChanges();

        }

      });

  }


  cancelStatusChange(): void {

    this.showStatusConfirm = false;

    this.selectedTeacher = null;

  }


  // =========================================================
  // DELETE TEACHER
  // =========================================================

  deleteTeacher(
    teacher: Teacher
  ): void {

    // -------------------------------------------------------
    // IMPORTANT:
    // Active teachers cannot be deleted.
    // -------------------------------------------------------

    if (teacher.isActive) {

      this.errorMessage =
        'Active teacher cannot be deleted. Please deactivate the teacher first.';

      this.cdr.detectChanges();

      return;

    }


    this.errorMessage = '';

    this.successMessage = '';

    this.selectedDeleteTeacher =
      teacher;

    this.showDeleteConfirm = true;

  }


  // =========================================================
  // CONFIRM DELETE
  // =========================================================

  confirmDelete(): void {

    if (!this.selectedDeleteTeacher) {

      return;

    }


    const teacher =
      this.selectedDeleteTeacher;


    // Extra frontend safety check
    if (teacher.isActive) {

      this.showDeleteConfirm = false;

      this.selectedDeleteTeacher = null;

      this.errorMessage =
        'Active teacher cannot be deleted. Please deactivate the teacher first.';

      this.cdr.detectChanges();

      return;

    }


    this.deleting = true;

    this.errorMessage = '';

    this.successMessage = '';


    this.teacherService
      .deleteTeacher(teacher.id)
      .subscribe({

        next: () => {

          this.deleting = false;

          this.showDeleteConfirm = false;

          this.selectedDeleteTeacher = null;

          this.successMessage =
            `Teacher ${teacher.firstName} ${teacher.lastName} deleted successfully.`;

          // Remove from current page immediately
          this.teachers =
            this.teachers.filter(
              item =>
                item.id !== teacher.id
            );

          this.totalElements =
            Math.max(
              0,
              this.totalElements - 1
            );

          this.cdr.detectChanges();


          setTimeout(() => {

            this.successMessage = '';

            this.cdr.detectChanges();

          }, 2500);

        },


        error: (error) => {

          console.error(
            'Failed to delete teacher:',
            error
          );

          this.deleting = false;

          this.showDeleteConfirm = false;

          this.selectedDeleteTeacher = null;

          this.errorMessage =
            this.getBackendErrorMessage(
              error,
              'Failed to delete teacher.'
            );

          this.cdr.detectChanges();

        }

      });

  }


  // =========================================================
  // CANCEL DELETE
  // =========================================================

  cancelDelete(): void {

    if (this.deleting) {

      return;

    }

    this.showDeleteConfirm = false;

    this.selectedDeleteTeacher = null;

  }


  // =========================================================
  // BACKEND ERROR MESSAGE
  // =========================================================

  private getBackendErrorMessage(
    error: any,
    defaultMessage: string
  ): string {

    const backendError =
      error?.error;


    // Main backend message
    if (
      backendError?.message &&
      typeof backendError.message === 'string'
    ) {

      return backendError.message;

    }


    // errors: ["message 1", "message 2"]
    if (
      Array.isArray(
        backendError?.errors
      )
    ) {

      const messages =
        backendError.errors
          .map((item: any) => {

            if (
              typeof item === 'string'
            ) {

              return item;

            }

            if (item?.message) {

              return item.message;

            }

            if (
              item?.defaultMessage
            ) {

              return item.defaultMessage;

            }

            return null;

          })
          .filter(
            (message: string | null) =>
              !!message
          );


      if (messages.length > 0) {

        return messages.join(' | ');

      }

    }


    return (
      error?.message ||
      defaultMessage
    );

  }

}