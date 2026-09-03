import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { TeacherAttendance } from '../services/teacher-attendance';

import {
  Attendance,
  AttendanceStatus
} from '../../../admin/attendance/models/attendance.model';

import {
  UpdateAttendanceRequest
} from '../models/update-attendance-request.model';

@Component({
  selector: 'app-edit-attendance',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],

  templateUrl: './edit-attendance.html',
  styleUrl: './edit-attendance.scss'
})
export class EditAttendanceComponent implements OnInit {

  private readonly attendanceService =
    inject(TeacherAttendance);

  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  private readonly cdr =
    inject(ChangeDetectorRef);

  attendanceId!: number;

  attendance: Attendance | null = null;

  status: AttendanceStatus = 'PRESENT';

  loading = false;
  saving = false;

  errorMessage = '';
  successMessage = '';

  ngOnInit(): void {
    const id =
      this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.errorMessage =
        'Attendance ID is missing.';
      return;
    }

    this.attendanceId = Number(id);

    this.loadAttendance();
  }

  loadAttendance(): void {
    this.loading = true;
    this.errorMessage = '';

    this.attendanceService
      .getAttendance()
      .subscribe({
        next: (response) => {

          const record =
            (response.data ?? [])
              .find(
                item =>
                  item.id === this.attendanceId
              );

          if (!record) {
            this.errorMessage =
              'Attendance record not found.';
            this.loading = false;
            this.cdr.detectChanges();
            return;
          }

          this.attendance = record;
          this.status = record.status;

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

  saveChanges(): void {

    if (!this.attendance) {
      return;
    }

    this.saving = true;
    this.errorMessage = '';
    this.successMessage = '';

    const request: UpdateAttendanceRequest = {
      status: this.status
    };

    this.attendanceService
      .updateAttendance(
        this.attendanceId,
        request
      )
      .subscribe({
        next: () => {

          this.saving = false;

          this.successMessage =
            'Attendance updated successfully.';

          this.cdr.detectChanges();

          setTimeout(() => {
            this.router.navigate([
              '/teacher/attendance'
            ]);
          }, 800);
        },

        error: (error) => {

          console.error(
            'Failed to update attendance:',
            error
          );

          this.errorMessage =
            error?.error?.message ??
            'Failed to update attendance.';

          this.saving = false;

          this.cdr.detectChanges();
        }
      });
  }
}