import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TeacherStudentService } from '../services/teacher-student.service';
import {
  TeacherStudent,
  TeacherStudentPage
} from '../models/teacher-student.model';

import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { SearchInputComponent } from '../../../../shared/components/search-input/search-input.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-teacher-student-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageHeaderComponent,
    SearchInputComponent,
    PaginationComponent,
    StatusBadgeComponent,
    LoadingComponent,
    EmptyStateComponent
  ],
  templateUrl: './teacher-student-list.html',
  styleUrl: './teacher-student-list.scss'
})
export class TeacherStudentListComponent implements OnInit {

  private readonly service = inject(TeacherStudentService);
  private readonly cdr = inject(ChangeDetectorRef);

  students: TeacherStudent[] = [];
  selectedStudent: TeacherStudent | null = null;

  searchTerm = '';

  currentPage = 0;
  pageSize = 10;

  totalElements = 0;
  totalPages = 0;

  isLoading = false;
  isLoadingStudent = false;

  errorMessage = '';

  ngOnInit(): void {
    this.loadStudents();
  }

  loadStudents(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    this.service
      .getStudents(
        this.currentPage,
        this.pageSize,
        this.searchTerm.trim()
      )
      .subscribe({
        next: (res) => {

          if (res.success) {
            const data: TeacherStudentPage = res.data;

            this.students = data.content ?? [];
            this.totalElements = data.totalElements ?? 0;
            this.totalPages = data.totalPages ?? 0;
            this.currentPage = data.number ?? this.currentPage;
          } else {
            this.students = [];
            this.totalElements = 0;
            this.totalPages = 0;
            this.errorMessage =
              res.message || 'Unable to load students.';
          }

          this.isLoading = false;
          this.cdr.markForCheck();
        },

        error: (error: any) => {

          console.error(
            'Failed to load teacher students:',
            error
          );

          this.students = [];
          this.totalElements = 0;
          this.totalPages = 0;

          this.errorMessage =
            error?.error?.message ||
            'Unable to load students. Please try again.';

          this.isLoading = false;
          this.cdr.markForCheck();
        }
      });
  }

  searchStudents(value?: string): void {
    if (typeof value === 'string') {
      this.searchTerm = value;
    }

    this.currentPage = 0;
    this.loadStudents();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.currentPage = 0;
    this.loadStudents();
  }

  goToPage(page: number): void {
    if (
      page < 0 ||
      page >= this.totalPages ||
      page === this.currentPage
    ) {
      return;
    }

    this.currentPage = page;
    this.loadStudents();
  }

  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadStudents();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadStudents();
    }
  }

  get pageNumbers(): number[] {
    if (this.totalPages <= 0) {
      return [];
    }

    const pages: number[] = [];

    const start = Math.max(
      0,
      this.currentPage - 2
    );

    const end = Math.min(
      this.totalPages - 1,
      this.currentPage + 2
    );

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  changePageSize(): void {
    this.currentPage = 0;
    this.loadStudents();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadStudents();
  }

  viewStudent(student: TeacherStudent): void {
    this.isLoadingStudent = true;
    this.selectedStudent = null;
    this.errorMessage = '';

    this.cdr.markForCheck();

    this.service
      .getStudentById(student.studentId)
      .subscribe({
        next: (res) => {

          if (res.success) {
            this.selectedStudent = res.data;
          } else {
            this.errorMessage =
              res.message ||
              'Unable to load student details.';
          }

          this.isLoadingStudent = false;
          this.cdr.markForCheck();
        },

        error: (error: any) => {

          console.error(
            'Failed to load student:',
            error
          );

          this.errorMessage =
            error?.error?.message ||
            'Unable to load student details.';

          this.isLoadingStudent = false;
          this.cdr.markForCheck();
        }
      });
  }

  closeStudentDetails(): void {
    this.selectedStudent = null;
    this.isLoadingStudent = false;
    this.cdr.markForCheck();
  }

  getStudentName(student: TeacherStudent): string {
    return `${student.firstName} ${student.lastName}`.trim();
  }

  getInitials(student: TeacherStudent): string {
    const first = student.firstName?.charAt(0) ?? '';
    const last = student.lastName?.charAt(0) ?? '';

    return `${first}${last}`.toUpperCase();
  }

  displayValue(value: string | null | undefined): string {
    return value?.trim() ? value : '—';
  }

  getStartRecord(): number {
    if (this.totalElements === 0) {
      return 0;
    }

    return this.currentPage * this.pageSize + 1;
  }

  getEndRecord(): number {
    return Math.min(
      (this.currentPage + 1) * this.pageSize,
      this.totalElements
    );
  }

  trackByStudentId(
    index: number,
    student: TeacherStudent
  ): number {
    return student.studentId;
  }
}