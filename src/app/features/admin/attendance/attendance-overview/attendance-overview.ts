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

import { Attendance } from '../models/attendance.model';
import { AttendanceService } from '../services/attendance.service';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-attendance-overview',
  standalone: true,

  imports: [
    CommonModule,
    DataTableComponent,
    SearchInputComponent,
    PaginationComponent
  ],

  templateUrl: './attendance-overview.html',
  styleUrl: './attendance-overview.scss'
})
export class AttendanceOverview implements OnInit {

  private readonly attendanceService =
    inject(AttendanceService);

  private readonly cdr =
    inject(ChangeDetectorRef);

  attendance: Attendance[] = [];

  private allAttendance: Attendance[] = [];

  filteredAttendance: Attendance[] = [];

  currentPage = 1;

  pageSize = 10;

  loading = false;

  errorMessage = '';

  search = '';

  statusFilter: 'ALL' | 'PRESENT' | 'ABSENT' = 'ALL';

  dateFilter = '';

  classFilter = 'ALL';

  sectionFilter = 'ALL';

columns: TableColumn[] = [
  {
    key: 'studentName',
    label: 'Student',
    sortable: true
  },
  {
    key: 'className',
    label: 'Class',
    sortable: true
  },
  {
    key: 'sectionName',
    label: 'Section',
    align: 'center',
    sortable: true
  },
  {
    key: 'attendanceDate',
    label: 'Date',
    type: 'date-time',
    sortable: true
  },
  {
    key: 'status',
    label: 'Status',
    align: 'center',
    type: 'status',
    sortable: true
  },
  {
    key: 'markedByTeacherName',
    label: 'Marked By',
    type: 'attendance-teacher',
    sortable: true
  },
  {
    key: 'lastUpdatedByTeacherName',
    label: 'Last Updated By',
    type: 'attendance-last-updated',
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
      .getAttendance()
      .subscribe({

        next: (response) => {
          this.allAttendance = response.data ?? [];

          this.applySearch();

          this.loading = false;

          this.cdr.detectChanges();
        },

        error: (error) => {
          console.error(
            'Failed to load attendance:',
            error
          );

          this.errorMessage =
            'Failed to load attendance.';

          this.loading = false;

          this.cdr.detectChanges();
        }
      });
  }

  applySearch(): void {
    const searchValue =
      this.search.trim().toLowerCase();

    this.filteredAttendance =
      this.allAttendance.filter((item) => {

        const matchesSection =
          this.sectionFilter === 'ALL' ||
          item.sectionName === this.sectionFilter;

        const matchesSearch =
          !searchValue ||
          item.studentName?.toLowerCase().includes(searchValue) ||
          item.className?.toLowerCase().includes(searchValue) ||
          item.sectionName?.toLowerCase().includes(searchValue) ||
          item.markedByTeacherName?.toLowerCase().includes(searchValue) ||
          item.status?.toLowerCase().includes(searchValue);

        const matchesStatus =
          this.statusFilter === 'ALL' ||
          item.status === this.statusFilter;

        const matchesDate =
          !this.dateFilter ||
          item.attendanceDate === this.dateFilter;

        const matchesClass =
          this.classFilter === 'ALL' ||
          item.className === this.classFilter;

        return (
          matchesSearch &&
          matchesStatus &&
          matchesDate &&
          matchesClass &&
          matchesSection
        );
      });

    this.currentPage = 1;

    this.updatePagination();
  }

  private updatePagination(): void {
    const startIndex =
      (this.currentPage - 1) * this.pageSize;

    const endIndex =
      startIndex + this.pageSize;

    this.attendance =
      this.filteredAttendance.slice(
        startIndex,
        endIndex
      );
  }

  onPageChange(page: number): void {
    this.currentPage = page;

    this.updatePagination();
  }

  get classOptions(): string[] {
    return [
      ...new Set(
        this.allAttendance
          .map(item => item.className)
          .filter(Boolean)
      )
    ];
  }

  get sectionOptions(): string[] {
    return [
      ...new Set(
        this.allAttendance
          .map(item => item.sectionName)
          .filter(Boolean)
      )
    ];
  }

  onSearchChange(value: string): void {
    this.search = value;
    this.applySearch();
  }

  onStatusChange(value: string): void {
    this.statusFilter =
      value as 'ALL' | 'PRESENT' | 'ABSENT';

    this.applySearch();
  }
  onDateChange(value: string): void {
    this.dateFilter = value;
    this.applySearch();
  }

  onClassChange(value: string): void {
    this.classFilter = value;
    this.applySearch();
  }

  onSectionChange(value: string): void {
    this.sectionFilter = value;
    this.applySearch();
  }

  clearFilters(): void {
    this.search = '';
    this.statusFilter = 'ALL';
    this.dateFilter = '';
    this.classFilter = 'ALL';
    this.sectionFilter = 'ALL';

    this.applySearch();
  }
}