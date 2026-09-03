import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  AttendanceStatus
} from '../../../admin/attendance/models/attendance.model';

import {
  MarkAttendanceRequest
} from '../models/attendance-request.model';

import {
  TeacherAttendanceAssignment
} from '../models/teacher-attendance-assignment.model';

import {
  AttendanceStudent
} from '../models/attendance-student.model';

import {
  TeacherAttendance
} from '../services/teacher-attendance';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-mark-attendance',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],

  templateUrl: './mark-attendance.html',
  styleUrl: './mark-attendance.scss'
})
export class MarkAttendanceComponent implements OnInit {

  today = new Date().toISOString().split('T')[0];

  private readonly attendanceService =
    inject(TeacherAttendance);

  private readonly cdr =
    inject(ChangeDetectorRef);

  


  // =========================================================
  // ASSIGNMENTS
  // =========================================================

  assignments: TeacherAttendanceAssignment[] = [];

  selectedAssignmentId: number | null = null;

  loadingAssignments = false;


  // =========================================================
  // STUDENTS
  // =========================================================

  students: AttendanceStudent[] = [];

  studentStatuses: Record<number, AttendanceStatus> = {};

  loadingStudents = false;


  // =========================================================
  // ATTENDANCE
  // =========================================================

  attendanceDate = this.getTodayDate();

  markingAttendance = false;


  // =========================================================
  // MESSAGES
  // =========================================================

  errorMessage = '';

  successMessage = '';


  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {
    this.loadAssignments();
  }


  // =========================================================
  // LOAD ASSIGNMENTS
  // =========================================================

  loadAssignments(): void {

    this.loadingAssignments = true;

    this.errorMessage = '';

    this.attendanceService
      .getMyTeacherAssignments()
      .subscribe({

        next: (response) => {

          this.assignments =
            response.data ?? [];

          this.loadingAssignments = false;

          this.cdr.detectChanges();
        },

        error: (error) => {

          console.error(
            'Failed to load teacher assignments:',
            error
          );

          this.errorMessage =
            error?.error?.message ||
            'Failed to load your assignments.';

          this.loadingAssignments = false;

          this.cdr.detectChanges();
        }

      });
  }


  // =========================================================
  // ASSIGNMENT CHANGE
  // =========================================================

  onAssignmentChange(): void {

    this.students = [];

    this.studentStatuses = {};

    this.successMessage = '';

    this.errorMessage = '';

    if (!this.selectedAssignmentId) {
      return;
    }

    this.loadStudents(
      this.selectedAssignmentId
    );
  }


  // =========================================================
  // LOAD STUDENTS
  // =========================================================

  loadStudents(
    assignmentId: number
  ): void {

    this.loadingStudents = true;

    this.attendanceService
      .getAttendanceStudents(assignmentId)
      .subscribe({

        next: (response) => {

          this.students =
            response.data ?? [];

          this.setDefaultStatuses();

          this.loadingStudents = false;

          this.cdr.detectChanges();
        },

        error: (error) => {

          console.error(
            'Failed to load attendance students:',
            error
          );

          this.students = [];

          this.errorMessage =
            error?.error?.message ||
            'Failed to load students.';

          this.loadingStudents = false;

          this.cdr.detectChanges();
        }

      });
  }


  // =========================================================
  // DEFAULT STATUS
  // =========================================================

  setDefaultStatuses(): void {

    this.studentStatuses = {};

    for (const student of this.students) {

      this.studentStatuses[
        student.studentId
      ] = 'PRESENT';
    }
  }


  // =========================================================
  // CHANGE STATUS
  // =========================================================

  setStatus(
    studentId: number,
    status: AttendanceStatus
  ): void {

    this.studentStatuses[studentId] =
      status;
  }


  // =========================================================
  // MARK ATTENDANCE
  // =========================================================

  markAttendance(): void {

    this.errorMessage = '';

    this.successMessage = '';


    if (!this.selectedAssignmentId) {

      this.errorMessage =
        'Please select an assignment.';

      return;
    }


    if (!this.attendanceDate) {

      this.errorMessage =
        'Please select an attendance date.';

      return;
    }


    if (this.students.length === 0) {

      this.errorMessage =
        'No students are available for this assignment.';

      return;
    }


    const request: MarkAttendanceRequest = {

      assignmentId:
        this.selectedAssignmentId,

      attendanceDate:
        this.attendanceDate,

      students:
        this.students.map(student => ({

          studentId:
            student.studentId,

          status:
            this.studentStatuses[
              student.studentId
            ] ?? 'PRESENT'

        }))
    };


    this.markingAttendance = true;


    this.attendanceService
      .markAttendance(request)
      .subscribe({

        next: (response) => {

          this.successMessage =
            response.message ||
            'Attendance marked successfully.';

          this.markingAttendance = false;

          this.cdr.detectChanges();
        },

        error: (error) => {

          console.error(
            'Failed to mark attendance:',
            error
          );

          this.errorMessage =
            error?.error?.message ||
            'Failed to mark attendance.';

          this.markingAttendance = false;

          this.cdr.detectChanges();
        }

      });
  }


  // =========================================================
  // TODAY
  // =========================================================

  private getTodayDate(): string {

    const today = new Date();

    const year =
      today.getFullYear();

    const month =
      String(
        today.getMonth() + 1
      ).padStart(2, '0');

    const day =
      String(
        today.getDate()
      ).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

}