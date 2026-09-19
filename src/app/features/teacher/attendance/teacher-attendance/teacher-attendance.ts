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

import { Attendance } from '../../../admin/attendance/models/attendance.model';
import { TeacherAttendance } from '../services/teacher-attendance';
import {
  Router,
  RouterLink
} from '@angular/router';

@Component({
  selector: 'app-teacher-attendance',
  standalone: true,

  imports: [
    CommonModule,
    DataTableComponent,
    SearchInputComponent,
    RouterLink
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

  attendance: Attendance[] = [];

  private allAttendance: Attendance[] = [];

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
      label: 'Student'
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
},
{
  key: 'lastUpdatedByTeacherName',
  label: 'Last Updated By',
  type: 'attendance-teacher'
}
  ];

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
            'Failed to load teacher attendance:',
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

  this.attendance =
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
onSearchChange(value: string): void {
  this.search = value;
  this.applySearch();
}
}