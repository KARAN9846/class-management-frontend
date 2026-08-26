import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import {
  DataTableComponent,
  TableColumn,
  TableAction
} from '../../../../shared/components/data-table/data-table.component';

import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { SearchInputComponent } from '../../../../shared/components/search-input/search-input.component';

import { Student } from '../models/student.model';
import { StudentService } from '../services/student.service';

@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [
    CommonModule,
    DataTableComponent,
    PaginationComponent,
    SearchInputComponent
  ],
  templateUrl: './student-list.html',
  styleUrl: './student-list.scss'
})
export class StudentList implements OnInit {

  readonly router = inject(Router);

  private readonly studentService = inject(StudentService);
  private readonly cdr = inject(ChangeDetectorRef);

  students: Student[] = [];

  loading = false;
  errorMessage = '';

  search = '';

  page = 0;
  size = 10;
  totalElements = 0;


  // =========================
  // TABLE COLUMNS
  // =========================

  columns: TableColumn[] = [
    {
      key: 'id',
      label: 'ID'
    },
      {
    key: 'rollNumber',
    label: 'Roll No.'
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


  // =========================
  // ACTIONS
  // =========================

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
    type: 'delete', danger: true
  }
  ];


  // =========================
  // INIT
  // =========================

  ngOnInit(): void {

   

    this.loadStudents();

  }


  // =========================
  // LOAD STUDENTS
  // =========================

  loadStudents(): void {

    this.loading = true;
    this.errorMessage = '';

    this.cdr.detectChanges();

    this.studentService
      .getStudents(
        this.page,
        this.size,
        this.search
      )
      .subscribe({

        next: (response) => {

          this.students =
            response.data.content;

          this.totalElements =
            response.data.totalElements;

          this.loading = false;

          this.cdr.detectChanges();

        },

        error: (error) => {

          console.error(
            'Failed to load students:',
            error
          );

          this.students = [];

          this.totalElements = 0;

          this.errorMessage =
            'Failed to load students. Please try again.';

          this.loading = false;

          this.cdr.detectChanges();

        }

      });

  }


  // =========================
  // SEARCH
  // =========================

  onSearch(value: string): void {

    this.search = value;

    this.page = 0;

    this.loadStudents();

  }


  // =========================
  // PAGINATION
  // =========================

  onPageChange(page: number): void {

    this.page = page - 1;

    this.loadStudents();

  }


  // =========================
  // ACTIONS
  // =========================

  onAction(event: any): void {

    const id = Number(
      event.row['id']
    );

    switch (event.action.type) {

      case 'view':

        this.router.navigate([
          '/admin/students',
          id
        ]);

        break;


      case 'edit':

        this.router.navigate([
          '/admin/students',
          id,
          'edit'
        ]);

        break;


      case 'status':

        this.toggleStatus(
          event.row
        );

        break;

        case 'delete':

  this.deleteStudent(
    event.row
  );

  break;

    }

  }


  // =========================
  // STATUS
  // =========================

  toggleStatus(student: Student): void {

    const newStatus =
      !student.isActive;

    const action =
      newStatus
        ? 'activate'
        : 'deactivate';

    const confirmed =
      window.confirm(
        `Are you sure you want to ${action} ${student.firstName} ${student.lastName}?`
      );

    if (!confirmed) {
      return;
    }


    this.studentService
      .updateStatus(
        student.id,
        newStatus
      )
      .subscribe({

        next: () => {

          // Update screen immediately
          student.isActive =
            newStatus;

          this.cdr.detectChanges();

        },

        error: (error) => {

          console.error(
            'Failed to update student status:',
            error
          );

          this.errorMessage =
            'Failed to update student status. Please try again.';

          this.cdr.detectChanges();

        }

      });

  }

  deleteStudent(student: Student): void {

  const confirmed = window.confirm(
    `Are you sure you want to delete ${student.firstName} ${student.lastName}?`
  );

  if (!confirmed) {
    return;
  }

  this.studentService
    .deleteStudent(student.id)
    .subscribe({

      next: () => {

        this.loadStudents();

      },

      error: (error) => {

        console.error(
          'Failed to delete student:',
          error
        );

        this.errorMessage =
          error?.error?.message ||
          error?.error?.error ||
          error?.message ||
          'Failed to delete student. Please try again.';

        this.cdr.detectChanges();

      }

    });
}
}