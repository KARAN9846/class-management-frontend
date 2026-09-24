import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  DataTableComponent,
  TableColumn
} from '../../../../shared/components/data-table/data-table.component';

import { SearchInputComponent } from '../../../../shared/components/search-input/search-input.component';

import { Attendance } from '../../../admin/attendance/models/attendance.model';
import { StudentAttendance } from '../services/student-attendance';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-student-attendance',
  standalone: true,

  imports: [
    CommonModule,
    DataTableComponent,
    SearchInputComponent,
    PaginationComponent
  ],

  templateUrl: './student-attendance.html',
  styleUrl: './student-attendance.scss'
})
export class StudentAttendanceComponent implements OnInit {

  private readonly attendanceService =
    inject(StudentAttendance);

  private readonly cdr =
    inject(ChangeDetectorRef);

  attendance: Attendance[] = [];

  allAttendance: Attendance[] = [];

  currentPage = 1;

  pageSize = 10;

  loading = false;

  errorMessage = '';

  search = '';

  columns: TableColumn[] = [
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
      label: 'Section',
      align: 'center'
    },
    {
      key: 'attendanceDate',
      label: 'Date'
    },
    {
      key: 'status',
      label: 'Status',
      align: 'center',
      type: 'status'
    },
    {
      key: 'markedByTeacherName',
      label: 'Marked By',
      type: 'attendance-teacher'
    }
  ];

  ngOnInit(): void {
    this.loadAttendance();
  }

  loadAttendance(): void {
    this.loading = true;
    this.errorMessage = '';

    this.attendanceService
      .getMyAttendance()
      .subscribe({
        next: (response) => {
          this.allAttendance = response.data ?? [];

          this.currentPage = 1;

          this.updatePagination();

          this.loading = false;

          this.cdr.detectChanges();
        },

        error: (error) => {
          console.error(
            'Failed to load student attendance:',
            error
          );

          this.errorMessage =
            'Failed to load attendance.';

          this.loading = false;

          this.cdr.detectChanges();
        }
      });
  }

  private updatePagination(): void {
  const startIndex =
    (this.currentPage - 1) * this.pageSize;

  const endIndex =
    startIndex + this.pageSize;

  this.attendance =
    this.allAttendance.slice(
      startIndex,
      endIndex
    );
}

onPageChange(page: number): void {
  this.currentPage = page;

  this.updatePagination();
}

  onSearchChange(value: string): void {
    this.search = value.trim().toLowerCase();
  }
}