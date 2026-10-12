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

  pageSize = 50;

  loading = false;

  errorMessage = '';

  search = '';

  filteredAttendanceCount = 0;

  get presentDays(): number {
    return this.allAttendance.filter(
      record => record.status === 'PRESENT'
    ).length;
  }

  get absentDays(): number {
    return this.allAttendance.filter(
      record => record.status === 'ABSENT'
    ).length;
  }

  get attendancePercentage(): number {
    return this.allAttendance.length
      ? Math.round(
          (this.presentDays / this.allAttendance.length) * 100
        )
      : 0;
  }

columns: TableColumn[] = [
  {
    key: 'attendanceDate',
    label: 'Date',
    width: '190px',
    type: 'date-time',
    sortable: true
  },
  {
    key: 'academicYearName',
    label: 'Academic Year',
    width: '170px',
    sortable: true
  },
  {
    key: 'className',
    label: 'Class',
    width: '150px',
    sortable: true
  },
  {
    key: 'sectionName',
    label: 'Section',
    width: '120px',
    align: 'center',
    sortable: true
  },
  {
    key: 'status',
    label: 'Status',
    width: '130px',
    align: 'center',
    type: 'status',
    sortable: true
  },
  {
    key: 'markedByTeacherName',
    label: 'Marked By',
    width: '220px',
    type: 'attendance-teacher',
    sortable: true
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
  const filteredAttendance =
    this.getFilteredAttendance();

  this.filteredAttendanceCount =
    filteredAttendance.length;

  const startIndex =
    (this.currentPage - 1) * this.pageSize;

  const endIndex =
    startIndex + this.pageSize;

  this.attendance =
    filteredAttendance.slice(
      startIndex,
      endIndex
    );
}

private getFilteredAttendance(): Attendance[] {
  if (!this.search) {
    return [...this.allAttendance];
  }

  return this.allAttendance.filter(record =>
    record.academicYearName?.toLowerCase().includes(this.search) ||
    record.className?.toLowerCase().includes(this.search) ||
    record.sectionName?.toLowerCase().includes(this.search) ||
    record.attendanceDate?.toLowerCase().includes(this.search) ||
    record.status?.toLowerCase().includes(this.search) ||
    record.markedByTeacherName?.toLowerCase().includes(this.search)
  );
}

onPageChange(page: number): void {
  this.currentPage = page;

  this.updatePagination();
}

  onSearchChange(value: string): void {
    this.search = value.trim().toLowerCase();

    this.currentPage = 1;

    this.updatePagination();
  }
}
