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
import {
  Attendance,
  AttendancePageQuery,
  AttendanceStatus
} from '../models/attendance.model';
import { AttendanceService } from '../services/attendance.service';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { AcademicYearService } from '../../academic/academic-years/services/academic-year.service';
import { AcademicYear } from '../../academic/academic-years/academic-year.model';
import { ClassService } from '../../academic/classes/class.service';
import { AcademicClass } from '../../academic/classes/class.model';

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

  private readonly attendanceService = inject(AttendanceService);
  private readonly academicYearService = inject(AcademicYearService);
  private readonly classService = inject(ClassService);
  private readonly cdr = inject(ChangeDetectorRef);

  attendance: Attendance[] = [];
  page = 0;
  pageSize = 50;
  totalElements = 0;
  loading = false;
  errorMessage = '';
  filterOptionsError = '';
  search = '';
  statusFilter: AttendanceStatus | 'ALL' = 'ALL';
  dateFilter = '';
  academicYearFilter: number | null = null;
  classFilter: number | null = null;
  sectionFilter: number | null = null;
  sortBy = 'attendanceDate';
  sortDirection: 'asc' | 'desc' = 'desc';
  academicYears: AcademicYear[] = [];
  classes: AcademicClass[] = [];

  private requestSequence = 0;

  columns: TableColumn[] = [
    {
      key: 'studentName',
      label: 'Student',
      width: '300px',
      type: 'attendance-student',
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
      sortable: false
    },
    {
      key: 'lastUpdatedByTeacherName',
      label: 'Last Updated By',
      type: 'attendance-last-updated',
      sortable: false
    }
  ];

  ngOnInit(): void {
    this.loadFilterOptions();
    this.loadAttendance();
  }

  loadAttendance(): void {
    const requestId = ++this.requestSequence;
    this.loading = true;
    this.errorMessage = '';

    const query: AttendancePageQuery = {
      page: this.page,
      size: this.pageSize,
      dateFrom: this.dateFilter || undefined,
      dateTo: this.dateFilter || undefined,
      status: this.statusFilter === 'ALL' ? undefined : this.statusFilter,
      academicYearId: this.academicYearFilter ?? undefined,
      classId: this.classFilter ?? undefined,
      sectionId: this.sectionFilter ?? undefined,
      search: this.search.trim() || undefined,
      sortBy: this.sortBy,
      sortDirection: this.sortDirection
    };

    this.attendanceService.getAttendancePage(query).subscribe({
      next: (response) => {
        if (requestId !== this.requestSequence) {
          return;
        }

        const pageResponse = response.data;
        this.attendance = pageResponse?.content ?? [];
        this.page = pageResponse?.page ?? this.page;
        this.pageSize = pageResponse?.size ?? this.pageSize;
        this.totalElements = pageResponse?.totalElements ?? 0;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        if (requestId !== this.requestSequence) {
          return;
        }

        console.error('Failed to load attendance:', error);
        this.errorMessage = 'Failed to load attendance.';
        this.attendance = [];
        this.totalElements = 0;
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private loadFilterOptions(): void {
    this.academicYearService.getAll(0, 100).subscribe({
      next: (response) => {
        this.academicYears = response.data?.content ?? [];
        this.cdr.detectChanges();
      },
      error: () => {
        this.filterOptionsError = 'Some filter options could not be loaded.';
        this.cdr.detectChanges();
      }
    });

    this.classService.getClasses().subscribe({
      next: (response) => {
        this.classes = response.data ?? [];
        this.cdr.detectChanges();
      },
      error: () => {
        this.filterOptionsError = 'Some filter options could not be loaded.';
        this.cdr.detectChanges();
      }
    });
  }

  onPageChange(pageOneBased: number): void {
    const nextPage = pageOneBased - 1;
    const totalPages = Math.ceil(this.totalElements / this.pageSize);

    if (nextPage < 0 || (totalPages > 0 && nextPage >= totalPages)) {
      return;
    }

    this.page = nextPage;
    this.loadAttendance();
  }

  get classOptions(): AcademicClass[] {
    return this.classes;
  }

  get sectionOptions() {
    const classes = this.classFilter === null
      ? this.classes
      : this.classes.filter(item => item.id === this.classFilter);
    const sections = classes.flatMap(item => item.sections ?? []);

    return sections.filter((section, index, all) =>
      all.findIndex(item => item.id === section.id) === index
    );
  }

  onSearchChange(value: string): void {
    this.search = value;
    this.resetAndLoad();
  }

  onStatusChange(value: string): void {
    this.statusFilter = value as AttendanceStatus | 'ALL';
    this.resetAndLoad();
  }

  onDateChange(value: string): void {
    this.dateFilter = value;
    this.resetAndLoad();
  }

  onAcademicYearChange(value: string): void {
    this.academicYearFilter = value === 'ALL' ? null : Number(value);
    this.resetAndLoad();
  }

  onClassChange(value: string): void {
    this.classFilter = value === 'ALL' ? null : Number(value);
    this.sectionFilter = null;
    this.resetAndLoad();
  }

  onSectionChange(value: string): void {
    this.sectionFilter = value === 'ALL' ? null : Number(value);
    this.resetAndLoad();
  }

  onSortChange(event: {
    sortBy: string | null;
    sortDirection: 'asc' | 'desc' | null;
  }): void {
    const allowedSortFields = new Set([
      'studentName',
      'attendanceDate',
      'status'
    ]);

    if (event.sortBy && !allowedSortFields.has(event.sortBy)) {
      return;
    }

    this.sortBy = event.sortBy ?? 'attendanceDate';
    this.sortDirection = event.sortDirection ?? 'desc';
    this.resetAndLoad();
  }

  private resetAndLoad(): void {
    this.page = 0;
    this.loadAttendance();
  }

  clearFilters(): void {
    this.search = '';
    this.statusFilter = 'ALL';
    this.dateFilter = '';
    this.academicYearFilter = null;
    this.classFilter = null;
    this.sectionFilter = null;
    this.sortBy = 'attendanceDate';
    this.sortDirection = 'desc';
    this.resetAndLoad();
  }
}
