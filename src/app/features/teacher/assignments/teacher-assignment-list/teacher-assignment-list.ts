import {
  Component,
  ChangeDetectorRef,
  OnInit,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import {
  DataTableComponent,
  TableColumn,
  TableAction
} from '../../../../shared/components/data-table/data-table.component';

import { SearchInputComponent } from '../../../../shared/components/search-input/search-input.component';

import { Assignment } from '../../../admin/assignments/models/assignment.model';
import { TeacherAssignmentService } from '../services/teacher-assignment.service';


@Component({
  selector: 'app-teacher-assignment-list',

  standalone: true,

  imports: [
    CommonModule,
    DataTableComponent,
    SearchInputComponent
  ],

  templateUrl: './teacher-assignment-list.html',

  styleUrl: './teacher-assignment-list.scss'
})
export class TeacherAssignmentList implements OnInit {

  readonly router = inject(Router);

  private readonly teacherAssignmentService =
    inject(TeacherAssignmentService);

  private readonly cdr =
    inject(ChangeDetectorRef);


  // =========================================================
  // DATA
  // =========================================================

  assignments: Assignment[] = [];

  private allAssignments: Assignment[] = [];

  loading = false;

  errorMessage = '';

  search = '';


  // =========================================================
  // TABLE COLUMNS
  // =========================================================

columns: TableColumn[] = [
  {
    key: 'title',
    label: 'Assignment',
    width: '420px',
    type: 'assignment-identity',
    assignmentTitleFirst: true,
    sortable: true
  },
  {
    key: 'dueDate',
    label: 'Due Date',
    type: 'date-time',
    sortable: true
  },
  {
    key: 'maxMarks',
    label: 'Marks',
    align: 'center',
    sortable: true
  },
  {
    key: 'status',
    label: 'Status',
    type: 'assignment-status',
    align: 'center',
    sortable: true
  }
];


  // =========================================================
  // ACTIONS
  // =========================================================

  actions: TableAction[] = [

    {
      label: 'Edit',
      type: 'edit'
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

    this.loadAssignments();

  }


  // =========================================================
  // LOAD MY ASSIGNMENTS
  // =========================================================

  loadAssignments(): void {

    this.loading = true;

    this.errorMessage = '';

    this.cdr.detectChanges();


    this.teacherAssignmentService
      .getMyAssignments()
      .subscribe({

        next: (response) => {

          this.allAssignments =
            response.data;

          this.applySearch();

          this.loading = false;

          this.cdr.detectChanges();

        },


        error: (error) => {

          console.error(
            'Failed to load my assignments:',
            error
          );

          this.assignments = [];

          this.errorMessage =
            error?.error?.message ||
            'Failed to load assignments. Please try again.';

          this.loading = false;

          this.cdr.detectChanges();

        }

      });

  }


  // =========================================================
  // SEARCH
  // =========================================================

  onSearch(value: string): void {

    this.search = value;

    this.applySearch();

  }


  // =========================================================
  // FILTER
  // =========================================================

  applySearch(): void {

    const value =
      this.search
        .trim()
        .toLowerCase();


    if (!value) {

      this.assignments =
        [...this.allAssignments];

      return;

    }


    this.assignments =
      this.allAssignments.filter(
        assignment =>

          assignment.title
            .toLowerCase()
            .includes(value)

          ||

          assignment.subjectName
            .toLowerCase()
            .includes(value)

          ||

          assignment.className
            .toLowerCase()
            .includes(value)

          ||

          assignment.sectionName
            .toLowerCase()
            .includes(value)

          ||

          assignment.status
            .toLowerCase()
            .includes(value)
      );

  }


  // =========================================================
  // TABLE ACTION
  // =========================================================

  onAction(event: any): void {

    const assignment =
      event.row as Assignment;


    switch (event.action.type) {

      // -----------------------------------------------------
      // EDIT
      // -----------------------------------------------------

      case 'edit':

        this.router.navigate([
          '/teacher/assignments',
          assignment.id,
          'edit'
        ]);

        break;


      // -----------------------------------------------------
      // DELETE
      // -----------------------------------------------------

      case 'delete':

        this.deleteAssignment(
          assignment
        );

        break;

    }

  }


  // =========================================================
  // DELETE
  // =========================================================

  deleteAssignment(
    assignment: Assignment
  ): void {

    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${assignment.title}"?`
      );


    if (!confirmed) {

      return;

    }


    this.teacherAssignmentService
      .deleteMyAssignment(
        assignment.id
      )
      .subscribe({

        next: () => {

          this.allAssignments =
            this.allAssignments.filter(
              item =>
                item.id !== assignment.id
            );

          this.applySearch();

          this.cdr.detectChanges();

        },


        error: (error) => {

          console.error(
            'Failed to delete assignment:',
            error
          );

          this.errorMessage =
            error?.error?.message ||
            'Failed to delete assignment. Please try again.';

          this.cdr.detectChanges();

        }

      });

  }

}
