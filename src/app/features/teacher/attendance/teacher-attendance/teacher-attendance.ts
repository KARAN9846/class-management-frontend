import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  DataTableComponent,
  TableColumn,
  TableAction
} from '../../../../shared/components/data-table/data-table.component';

import { SearchInputComponent } from '../../../../shared/components/search-input/search-input.component';
import { PermissionService } from '../../../../core/auth/permission.service';

import {
  Attendance,
  AttendancePageQuery,
  AttendanceStatus
} from '../../../admin/attendance/models/attendance.model';
import { TeacherAttendance } from '../services/teacher-attendance';
import { TeacherAttendanceAssignment } from '../models/teacher-attendance-assignment.model';

import {
  Router,
  RouterLink
} from '@angular/router';

import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-teacher-attendance',
  standalone: true,

  imports: [
    CommonModule,
    DataTableComponent,
    SearchInputComponent,
    RouterLink,
    PaginationComponent
  ],

  templateUrl: './teacher-attendance.html',
  styleUrl: './teacher-attendance.scss'
})
export class TeacherAttendanceComponent implements OnInit {

  private readonly attendanceService =
    inject(TeacherAttendance);

  private readonly router =
    inject(Router);

  private readonly cdr =
    inject(ChangeDetectorRef);

  private readonly permissionService =
    inject(PermissionService);

  attendance: Attendance[] = [];

  page = 0;

  pageSize = 50;

  totalElements = 0;

  loading = false;

  errorMessage = '';

  search = '';

  statusFilter: AttendanceStatus | 'ALL' = 'ALL';

  dateFilter = '';

  academicYearFilter: number | null = null;

  classFilter: number | null = null;

  sectionFilter: number | null = null;

  assignments: TeacherAttendanceAssignment[] = [];

  filterOptionsError = '';

  sortBy = 'attendanceDate';

  sortDirection: 'asc' | 'desc' = 'desc';

  private requestSequence = 0;

columns: TableColumn[] = [
  {
    key: 'studentName',
    label: 'Student',
    width: '320px',
    type: 'attendance-student',
    attendanceInitialsAvatar: true,
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

  canMarkAttendance(): boolean {
    return this.permissionService.hasPermission(
      'ATTENDANCE_MARK'
    );
  }

  canEditAttendance(): boolean {
    return this.permissionService.hasPermission(
      'ATTENDANCE_EDIT'
    );
  }

  get actions(): TableAction[] {
    return this.canEditAttendance()
      ? [
          {
            label: 'Edit',
            type: 'edit'
          }
        ]
      : [];
  }

  onActionClick(event: any): void {

    if (
      event.action.type === 'edit' &&
      this.canEditAttendance()
    ) {

      const attendanceId =
        event.row.id;

      this.router.navigate([
        '/teacher/attendance/edit',
        attendanceId
      ]);
    }
  }

  ngOnInit(): void {

    this.permissionService
      .loadMyPermissions()
      .subscribe({
        next: () => {
          this.loadAttendance();
          this.loadFilterOptions();
        },

        error: (error) => {
          console.error(
            'Failed to load teacher permissions:',
            error
          );

          this.errorMessage =
            'Failed to load attendance permissions.';

          this.cdr.detectChanges();
        }
      });
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

    this.attendanceService
      .getAttendancePage(query)
      .subscribe({

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

          console.error(
            'Failed to load teacher attendance:',
            error
          );

          this.errorMessage =
            'Failed to load attendance.';

          this.attendance = [];
          this.totalElements = 0;

          this.loading = false;

          this.cdr.detectChanges();
        }
      });
  }

  private loadFilterOptions(): void {
    this.attendanceService.getMyTeacherAssignments().subscribe({
      next: (response) => {
        this.assignments = response.data ?? [];
        this.filterOptionsError = '';
        this.cdr.detectChanges();
      },
      error: () => {
        this.filterOptionsError =
          'Some attendance filter options could not be loaded.';
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

  get academicYearOptions(): TeacherAttendanceAssignment[] {
    return this.assignments.filter((assignment, index, all) =>
      all.findIndex(item => item.academicYearId === assignment.academicYearId) === index
    );
  }

  get classOptions(): TeacherAttendanceAssignment[] {
    const assignments = this.academicYearFilter === null
      ? this.assignments
      : this.assignments.filter(item => item.academicYearId === this.academicYearFilter);

    return assignments.filter((assignment, index, all) =>
      all.findIndex(item => item.classId === assignment.classId) === index
    );
  }

  get sectionOptions(): TeacherAttendanceAssignment[] {
    const assignments = this.classFilter === null
      ? this.assignments
      : this.assignments.filter(item => item.classId === this.classFilter);

    const yearScopedAssignments = this.academicYearFilter === null
      ? assignments
      : assignments.filter(item => item.academicYearId === this.academicYearFilter);

    return yearScopedAssignments.filter((assignment, index, all) =>
      all.findIndex(item => item.sectionId === assignment.sectionId) === index
    );
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
    this.classFilter = null;
    this.sectionFilter = null;
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

  onSearchChange(value: string): void {
    this.search = value;
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
