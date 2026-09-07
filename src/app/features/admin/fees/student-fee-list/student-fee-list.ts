import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AcademicYearService } from '../../academic/academic-years/services/academic-year.service';
import { ClassService } from '../../academic/classes/class.service';

import { StudentFeeService } from '../services/student-fee.service';
import { StudentFee } from '../models/student-fee.model';

@Component({
  selector: 'app-student-fee-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './student-fee-list.html',
  styleUrl: './student-fee-list.scss'
})
export class StudentFeeList implements OnInit {

  private readonly academicYearService = inject(AcademicYearService);
  private readonly classService = inject(ClassService);
  private readonly studentFeeService = inject(StudentFeeService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  studentFees: StudentFee[] = [];

  academicYears: any[] = [];

  allClasses: any[] = [];
  classes: any[] = [];

  academicYearFilter: number | 'ALL' = 'ALL';
  classFilter: number | 'ALL' = 'ALL';

  loading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.loadAcademicYears();
  }

  loadAcademicYears(): void {

    this.loading = true;
    this.errorMessage = '';

    this.academicYearService.getAll().subscribe({

      next: (response) => {

        this.academicYears = response.data.content ?? [];

        const currentYear = this.academicYears.find(
          (year: any) => year.isCurrent === true
        );

        if (currentYear) {

          this.academicYearFilter = currentYear.id;

        } else if (this.academicYears.length > 0) {

          this.academicYearFilter =
            this.academicYears[0].id;

        } else {

          this.academicYearFilter = 'ALL';

        }

        this.loadClasses();

      },

      error: (error) => {

        console.error(
          'Failed to load academic years:',
          error
        );

        this.loading = false;

        this.errorMessage =
          error?.error?.message ||
          error?.message ||
          'Failed to load academic years.';

        this.cdr.detectChanges();
      }

    });
  }

  loadClasses(): void {

    this.classService.getClasses().subscribe({

      next: (response) => {

        this.allClasses = response.data ?? [];

        this.filterClassesByYear();

        /*
         * IMPORTANT:
         * Load student fees immediately after
         * academic years and classes are ready.
         */
        this.loadStudentFees();

      },

      error: (error) => {

        console.error(
          'Failed to load classes:',
          error
        );

        this.loading = false;

        this.errorMessage =
          error?.error?.message ||
          error?.message ||
          'Failed to load classes.';

        this.cdr.detectChanges();
      }

    });
  }

  filterClassesByYear(): void {

    if (this.academicYearFilter === 'ALL') {

      this.classes = [
        ...this.allClasses
      ];

    } else {

      this.classes = this.allClasses.filter(
        (item: any) =>
          item.academicYearId === this.academicYearFilter
      );

    }

    this.classFilter = 'ALL';
  }

  onAcademicYearChange(): void {

    this.classFilter = 'ALL';

    this.filterClassesByYear();

    this.loadStudentFees();
  }

  onClassChange(): void {

    this.loadStudentFees();
  }

  loadStudentFees(): void {

    this.loading = true;
    this.errorMessage = '';

    /*
     * All academic years
     */
    if (this.academicYearFilter === 'ALL') {

      this.studentFeeService.getAll().subscribe({

        next: (response) => {

          this.studentFees =
            response.data ?? [];

          this.loading = false;

          this.cdr.detectChanges();
        },

        error: (error) => {

          console.error(
            'Failed to load student fees:',
            error
          );

          this.studentFees = [];

          this.loading = false;

          this.errorMessage =
            error?.error?.message ||
            error?.message ||
            'Failed to load student fees.';

          this.cdr.detectChanges();
        }

      });

      return;
    }

    /*
     * Selected academic year,
     * all classes
     */
    if (this.classFilter === 'ALL') {

      this.studentFeeService
        .getAll(this.academicYearFilter)
        .subscribe({

          next: (response) => {

            this.studentFees =
              response.data ?? [];

            this.loading = false;

            this.cdr.detectChanges();
          },

          error: (error) => {

            console.error(
              'Failed to load student fees:',
              error
            );

            this.studentFees = [];

            this.loading = false;

            this.errorMessage =
              error?.error?.message ||
              error?.message ||
              'Failed to load student fees.';

            this.cdr.detectChanges();
          }

        });

      return;
    }

    /*
     * Selected academic year
     * + selected class
     */
    this.studentFeeService
      .getByClass(
        this.academicYearFilter,
        this.classFilter
      )
      .subscribe({

        next: (response) => {

          this.studentFees =
            response.data ?? [];

          this.loading = false;

          this.cdr.detectChanges();
        },

        error: (error) => {

          console.error(
            'Failed to load student fees:',
            error
          );

          this.studentFees = [];

          this.loading = false;

          this.errorMessage =
            error?.error?.message ||
            error?.message ||
            'Failed to load student fees.';

          this.cdr.detectChanges();
        }

      });
  }

  get totalPayable(): number {

    return this.studentFees.reduce(
      (total, fee) =>
        total + Number(fee.payableAmount),
      0
    );
  }

  get totalPaid(): number {

    return this.studentFees.reduce(
      (total, fee) =>
        total + Number(fee.paidAmount),
      0
    );
  }

  get totalRemaining(): number {

    return this.studentFees.reduce(
      (total, fee) =>
        total + Number(fee.remainingAmount),
      0
    );
  }

  getStatusClass(status: string): string {

    switch (status) {

      case 'PAID':
        return 'status-paid';

      case 'REMAINING':
        return 'status-remaining';

      default:
        return 'status-unpaid';
    }
  }

  viewStudentFee(fee: StudentFee): void {

    this.router.navigate([
      '/admin/fees/student-fees',
      fee.id
    ]);
  }

editStudentFee(fee: StudentFee): void {
  this.router.navigate([
    '/admin/fees/student-fees',
    fee.id,
    'edit'
  ]);
}

  addPayment(fee: StudentFee): void {

    if (fee.remainingAmount <= 0) {
      return;
    }

    this.router.navigate([
      '/admin/fees/student-fees',
      fee.id,
      'payment'
    ]);
  }
}