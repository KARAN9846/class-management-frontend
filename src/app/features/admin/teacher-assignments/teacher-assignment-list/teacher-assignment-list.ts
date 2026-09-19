import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import {
  TeacherAssignment
} from '../models/teacher-assignment.model';

import {
  TeacherAssignmentService
} from '../services/teacher-assignment.service';


@Component({
  selector: 'app-teacher-assignment-list',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './teacher-assignment-list.html',

  styleUrl: './teacher-assignment-list.scss'
})
export class TeacherAssignmentList implements OnInit {

  private readonly service =
    inject(TeacherAssignmentService);

readonly router = inject(Router);

  private readonly cdr =
    inject(ChangeDetectorRef);


  // =========================================================
  // DATA
  // =========================================================

  allAssignments: TeacherAssignment[] = [];

  assignments: TeacherAssignment[] = [];

  loading = false;

  deleting = false;

  errorMessage = '';

  successMessage = '';


  // =========================================================
  // FILTERS
  // =========================================================

  searchTerm = '';

  selectedAcademicYear = '';


  // =========================================================
  // ACTION MENU
  // =========================================================

  openMenuId: number | null = null;


  // =========================================================
  // DELETE DIALOG
  // =========================================================

  showDeleteDialog = false;

  pendingAssignment: TeacherAssignment | null = null;


  // =========================================================
  // PAGINATION
  // =========================================================

  currentPage = 1;

  pageSize = 10;


  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {

    this.loadAssignments();

  }


  // =========================================================
  // LOAD
  // =========================================================

  loadAssignments(): void {

    this.loading = true;

    this.errorMessage = '';

    this.openMenuId = null;

    this.service
      .getAll()
      .subscribe({

        next: (response) => {

          this.allAssignments =
            response.data ?? [];

          this.currentPage = 1;

          this.applyFilters();

          this.loading = false;

          this.cdr.detectChanges();

        },

        error: (error) => {

          console.error(
            'Failed to load teacher assignments:',
            error
          );

          this.allAssignments = [];

          this.assignments = [];

          this.loading = false;

          this.errorMessage =
            error?.error?.message ||
            'Failed to load teacher assignments. Please try again.';

          this.cdr.detectChanges();

        }

      });

  }


  // =========================================================
  // SEARCH
  // =========================================================

  onSearchChange(): void {

    this.currentPage = 1;

    this.applyFilters();

  }


  // =========================================================
  // ACADEMIC YEAR FILTER
  // =========================================================

  onAcademicYearChange(): void {

    this.currentPage = 1;

    this.applyFilters();

  }


  // =========================================================
  // FILTER
  // =========================================================

  applyFilters(): void {

    const search =
      this.searchTerm
        .trim()
        .toLowerCase();

    this.assignments =
      this.allAssignments.filter(
        assignment => {

          const matchesSearch =
            !search ||
            assignment.teacherName
              .toLowerCase()
              .includes(search) ||
            assignment.academicYearName
              .toLowerCase()
              .includes(search) ||
            assignment.className
              .toLowerCase()
              .includes(search) ||
            assignment.sectionName
              .toLowerCase()
              .includes(search) ||
            assignment.subjectName
              .toLowerCase()
              .includes(search);

          const matchesYear =
            !this.selectedAcademicYear ||
            assignment.academicYearName ===
              this.selectedAcademicYear;

          return (
            matchesSearch &&
            matchesYear
          );

        }
      );

    this.ensureValidPage();

  }


  // =========================================================
  // ACADEMIC YEARS
  // =========================================================

  get academicYears(): string[] {

    return Array.from(
      new Set(
        this.allAssignments
          .map(
            assignment =>
              assignment.academicYearName
          )
      )
    ).sort();

  }


  // =========================================================
  // PAGINATED DATA
  // =========================================================

  get paginatedAssignments():
    TeacherAssignment[] {

    const start =
      (this.currentPage - 1) *
      this.pageSize;

    return this.assignments.slice(
      start,
      start + this.pageSize
    );

  }


  get totalPages(): number {

    return Math.max(
      1,
      Math.ceil(
        this.assignments.length /
        this.pageSize
      )
    );

  }


  get pageStart(): number {

    if (!this.assignments.length) {
      return 0;
    }

    return (
      (this.currentPage - 1) *
      this.pageSize
    ) + 1;

  }


  get pageEnd(): number {

    return Math.min(
      this.currentPage * this.pageSize,
      this.assignments.length
    );

  }


  // =========================================================
  // PAGINATION
  // =========================================================

  previousPage(): void {

    if (this.currentPage <= 1) {
      return;
    }

    this.currentPage--;

  }


  nextPage(): void {

    if (
      this.currentPage >=
      this.totalPages
    ) {
      return;
    }

    this.currentPage++;

  }


  goToPage(page: number): void {

    if (
      page < 1 ||
      page > this.totalPages
    ) {
      return;
    }

    this.currentPage = page;

  }


  get visiblePages(): number[] {

    return Array.from(
      {
        length: this.totalPages
      },
      (_, index) => index + 1
    );

  }


  private ensureValidPage(): void {

    if (
      this.currentPage >
      this.totalPages
    ) {
      this.currentPage =
        this.totalPages;
    }

  }


  // =========================================================
  // ACTION MENU
  // =========================================================

  toggleActionMenu(
    id: number
  ): void {

    this.openMenuId =
      this.openMenuId === id
        ? null
        : id;

  }


  closeActionMenu(): void {

    this.openMenuId = null;

  }


  // =========================================================
  // VIEW
  // =========================================================

  viewAssignment(
    id: number
  ): void {

    this.closeActionMenu();

    this.router.navigate([
      '/admin/teacher-assignments',
      id,
      'view'
    ]);

  }


  // =========================================================
  // EDIT
  // =========================================================

  editAssignment(
    id: number
  ): void {

    this.closeActionMenu();

    this.router.navigate([
      '/admin/teacher-assignments',
      id,
      'edit'
    ]);

  }

  createAssignment(): void {
  this.router.navigate(['/admin/teacher-assignments/create']);
}


  // =========================================================
  // DELETE
  // =========================================================

  deleteAssignment(
    assignment: TeacherAssignment
  ): void {

    this.closeActionMenu();

    this.pendingAssignment =
      assignment;

    this.showDeleteDialog = true;

  }


  // =========================================================
  // CONFIRM DELETE
  // =========================================================

  confirmDelete(): void {

    if (
      !this.pendingAssignment ||
      this.deleting
    ) {
      return;
    }

    const assignment =
      this.pendingAssignment;

    this.deleting = true;

    this.errorMessage = '';

    this.service
      .delete(
        assignment.id
      )
      .subscribe({

        next: () => {

          this.allAssignments =
            this.allAssignments.filter(
              item =>
                item.id !==
                assignment.id
            );

          this.showDeleteDialog = false;

          this.pendingAssignment = null;

          this.deleting = false;

          this.successMessage =
            'Teacher assignment deleted successfully.';

          this.applyFilters();

          this.cdr.detectChanges();

        },

        error: (error) => {

          console.error(
            'Failed to delete teacher assignment:',
            error
          );

          this.deleting = false;

          this.errorMessage =
            error?.error?.message ||
            'Failed to delete teacher assignment. Please try again.';

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

    this.showDeleteDialog = false;

    this.pendingAssignment = null;

  }

}