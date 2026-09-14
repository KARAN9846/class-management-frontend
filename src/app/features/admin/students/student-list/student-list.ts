import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ConfirmationDialogComponent } from '../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import {
  DataTableComponent,
  TableColumn,
  TableAction
} from '../../../../shared/components/data-table/data-table.component';

import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { SearchInputComponent } from '../../../../shared/components/search-input/search-input.component';

import { Student } from '../models/student.model';
import { StudentService } from '../services/student.service';

import { AcademicYearService } from '../../academic/academic-years/services/academic-year.service';
import { AcademicYear } from '../../academic/academic-years/academic-year.model';

import { ClassService } from '../../academic/classes/class.service';
import { AcademicClass } from '../../academic/classes/class.model';

import { SectionService } from '../../academic/classes/section.service';
import { Section } from '../../academic/classes/section.model';

@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [
    CommonModule,
    DataTableComponent,
    PaginationComponent,
    SearchInputComponent,
  ConfirmationDialogComponent
  ],
  templateUrl: './student-list.html',
  styleUrl: './student-list.scss'
})
export class StudentList implements OnInit {

  readonly router = inject(Router);

  private readonly studentService = inject(StudentService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly academicYearService = inject(AcademicYearService);
private readonly classService = inject(ClassService);
private readonly sectionService = inject(SectionService);

  students: Student[] = [];

  loading = false;
  errorMessage = '';

  search = '';

  // =========================
// FILTERS
// =========================

academicYears: AcademicYear[] = [];
classes: AcademicClass[] = [];
sections: Section[] = [];

selectedAcademicYearId: number | null = null;
selectedClassId: number | null = null;
selectedSectionId: number | null = null;

  page = 0;
  size = 10;
  totalElements = 0;

    // =========================
  // CONFIRMATION DIALOG
  // =========================

  showConfirmationDialog = false;

  confirmationTitle = '';
  confirmationMessage = '';
  confirmationConfirmLabel = 'Confirm';

  pendingStudent: Student | null = null;
  pendingAction: 'status' | 'delete' | null = null;
  pendingNewStatus: boolean | null = null;


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
    key: 'academicYearName',
    label: 'Academic Year'
  },
{
  key: 'className',
  label: 'Class'
},
{
  key: 'sectionName',
  label: 'Section'
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

  this.loadAcademicYears();
  this.loadClasses();
  this.loadStudents();

}

// =========================
// LOAD ACADEMIC YEARS
// =========================

loadAcademicYears(): void {

  this.academicYearService
    .getAll()
    .subscribe({

      next: (response) => {

        this.academicYears =
          response.data.content;

      },

      error: (error) => {

        console.error(
          'Failed to load academic years:',
          error
        );

        this.academicYears = [];

      }

    });

}


// =========================
// LOAD CLASSES
// =========================

loadClasses(): void {

  this.classService
    .getClasses()
    .subscribe({

      next: (response) => {

        this.classes =
          response.data;

      },

      error: (error) => {

        console.error(
          'Failed to load classes:',
          error
        );

        this.classes = [];

      }

    });

}


// =========================
// LOAD SECTIONS
// =========================

loadSections(): void {

  this.sections = [];

  this.selectedSectionId = null;

  if (this.selectedClassId === null) {
    return;
  }

  this.sectionService
    .getSections(this.selectedClassId)
    .subscribe({

      next: (response) => {

        this.sections =
          response.data;

      },

      error: (error) => {

        console.error(
          'Failed to load sections:',
          error
        );

        this.sections = [];

      }

    });

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
    this.search,
    this.selectedAcademicYearId ?? undefined,
    this.selectedClassId ?? undefined,
    this.selectedSectionId ?? undefined
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
// ACADEMIC YEAR FILTER
// =========================

onAcademicYearChange(
  value: string
): void {

  this.selectedAcademicYearId =
    value
      ? Number(value)
      : null;

  this.selectedClassId = null;
  this.selectedSectionId = null;

  this.sections = [];

  this.page = 0;

  this.loadStudents();

}

get filteredClasses(): AcademicClass[] {

  if (this.selectedAcademicYearId === null) {
    return this.classes;
  }

  return this.classes.filter(
    classItem =>
      classItem.academicYearId ===
      this.selectedAcademicYearId
  );

}

// =========================
// CLASS FILTER
// =========================

onClassChange(
  value: string
): void {

  this.selectedClassId =
    value
      ? Number(value)
      : null;

  this.selectedSectionId = null;

  this.sections = [];

  if (this.selectedClassId !== null) {
    this.loadSections();
  }

  this.page = 0;

  this.loadStudents();

}


// =========================
// SECTION FILTER
// =========================

onSectionChange(
  value: string
): void {

  this.selectedSectionId =
    value
      ? Number(value)
      : null;

  this.page = 0;

  this.loadStudents();

}


// =========================
// CLEAR FILTERS
// =========================

clearFilters(): void {

  this.selectedAcademicYearId = null;
  this.selectedClassId = null;
  this.selectedSectionId = null;

  this.sections = [];

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


    this.pendingStudent = student;

    this.pendingAction = 'status';

    this.pendingNewStatus =
      newStatus;

    this.confirmationTitle =
      newStatus
        ? 'Activate Student?'
        : 'Deactivate Student?';

    this.confirmationMessage =
      `Are you sure you want to ${action} ${student.firstName} ${student.lastName}?`;

    this.confirmationConfirmLabel =
      newStatus
        ? 'Activate'
        : 'Deactivate';

    this.showConfirmationDialog = true;

  }

   // =========================
  // DELETE
  // =========================

  deleteStudent(student: Student): void {

    this.pendingStudent = student;

    this.pendingAction = 'delete';

    this.pendingNewStatus = null;

    this.confirmationTitle =
      'Delete Student?';

    this.confirmationMessage =
      `Are you sure you want to delete ${student.firstName} ${student.lastName}?`;

    this.confirmationConfirmLabel =
      'Delete';

    this.showConfirmationDialog = true;

  }

    // =========================
  // CONFIRM ACTION
  // =========================

  confirmAction(): void {

    const student = this.pendingStudent;

    const action = this.pendingAction;


    if (!student || !action) {

      return;

    }


    this.showConfirmationDialog = false;


    if (action === 'status') {

      const newStatus =
        this.pendingNewStatus;

      if (newStatus === null) {

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


    if (action === 'delete') {

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


    this.pendingStudent = null;

    this.pendingAction = null;

    this.pendingNewStatus = null;

  }


  // =========================
  // CANCEL CONFIRMATION
  // =========================

  cancelConfirmation(): void {

    this.showConfirmationDialog = false;

    this.pendingStudent = null;

    this.pendingAction = null;

    this.pendingNewStatus = null;

  }
}