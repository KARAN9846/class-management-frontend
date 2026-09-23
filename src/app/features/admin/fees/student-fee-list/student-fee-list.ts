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

  private readonly academicYearService =
    inject(AcademicYearService);

  private readonly classService =
    inject(ClassService);

  private readonly studentFeeService =
    inject(StudentFeeService);

  private readonly router =
    inject(Router);

  private readonly cdr =
    inject(ChangeDetectorRef);


  // =====================================================
  // DATA
  // =====================================================

  studentFees: StudentFee[] = [];

  academicYears: any[] = [];

  allClasses: any[] = [];

  classes: any[] = [];


  // =====================================================
  // SERVER-SIDE FILTERS
  // =====================================================

  academicYearFilter: number | 'ALL' = 'ALL';

  classFilter: number | 'ALL' = 'ALL';


  // =====================================================
  // CLIENT-SIDE FILTERS
  // =====================================================

  searchTerm = '';

  statusFilter:
    | 'ALL'
    | 'PAID'
    | 'REMAINING'
    | 'UNPAID' = 'ALL';

  feeRangeFilter:
    | 'ALL'
    | '0_10000'
    | '10000_25000'
    | '25000_PLUS' = 'ALL';


  // =====================================================
  // SORTING
  // =====================================================

  sortField:
    | 'NONE'
    | 'STUDENT_NAME'
    | 'PAYABLE_AMOUNT'
    | 'PAID_AMOUNT'
    | 'REMAINING_AMOUNT' = 'NONE';

  sortDirection:
    | 'ASC'
    | 'DESC' = 'ASC';


  // =====================================================
  // STATE
  // =====================================================

  loading = false;

  errorMessage = '';


  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {

    this.loadAcademicYears();

  }


  // =====================================================
  // LOAD ACADEMIC YEARS
  // =====================================================

  loadAcademicYears(): void {

    this.loading = true;
    this.errorMessage = '';

    this.academicYearService.getAll().subscribe({

      next: (response) => {

        this.academicYears =
          response.data.content ?? [];


        const currentYear =
          this.academicYears.find(
            (year: any) =>
              year.isCurrent === true
          );


        if (currentYear) {

          this.academicYearFilter =
            currentYear.id;

        } else if (
          this.academicYears.length > 0
        ) {

          this.academicYearFilter =
            this.academicYears[0].id;

        } else {

          this.academicYearFilter =
            'ALL';

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


  // =====================================================
  // LOAD CLASSES
  // =====================================================

  loadClasses(): void {

    this.classService.getClasses().subscribe({

      next: (response) => {

        this.allClasses =
          response.data ?? [];

        this.filterClassesByYear();

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


  // =====================================================
  // FILTER CLASSES BY ACADEMIC YEAR
  // =====================================================

  filterClassesByYear(): void {

    if (this.academicYearFilter === 'ALL') {

      this.classes = [
        ...this.allClasses
      ];

    } else {

      this.classes =
        this.allClasses.filter(
          (item: any) =>
            item.academicYearId ===
            this.academicYearFilter
        );

    }

    this.classFilter = 'ALL';

  }


  // =====================================================
  // ACADEMIC YEAR CHANGE
  // =====================================================

  onAcademicYearChange(): void {

    this.classFilter = 'ALL';

    this.filterClassesByYear();

    this.loadStudentFees();

  }


  // =====================================================
  // CLASS CHANGE
  // =====================================================

  onClassChange(): void {

    this.loadStudentFees();

  }


  // =====================================================
  // LOAD STUDENT FEES
  // =====================================================

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

          this.handleLoadError(
            error,
            'Failed to load student fees.'
          );

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

            this.handleLoadError(
              error,
              'Failed to load student fees.'
            );

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

          this.handleLoadError(
            error,
            'Failed to load student fees.'
          );

        }

      });

  }


  // =====================================================
  // LOAD ERROR
  // =====================================================

  private handleLoadError(
    error: any,
    fallbackMessage: string
  ): void {

    console.error(
      'Failed to load student fees:',
      error
    );

    this.studentFees = [];

    this.loading = false;

    this.errorMessage =
      error?.error?.message ||
      error?.message ||
      fallbackMessage;

    this.cdr.detectChanges();

  }


  // =====================================================
  // FILTERED + SORTED DATA
  // =====================================================

  get filteredStudentFees(): StudentFee[] {

    let result =
      [...this.studentFees];


    // ===================================================
    // SEARCH
    // ===================================================

    const search =
      this.searchTerm
        .trim()
        .toLowerCase();


    if (search) {

      result =
        result.filter(
          fee => {

            const studentName =
              fee.studentName
                ?.toLowerCase() ?? '';

            const rollNumber =
              fee.rollNumber
                ?.toLowerCase() ?? '';

            const className =
              fee.className
                ?.toLowerCase() ?? '';

            const sectionName =
              fee.sectionName
                ?.toLowerCase() ?? '';


            return (
              studentName.includes(search) ||
              rollNumber.includes(search) ||
              className.includes(search) ||
              sectionName.includes(search)
            );

          }
        );

    }


    // ===================================================
    // STATUS FILTER
    // ===================================================

    if (this.statusFilter !== 'ALL') {

      result =
        result.filter(
          fee =>
            fee.status ===
            this.statusFilter
        );

    }


    // ===================================================
    // FEE RANGE FILTER
    // ===================================================

    if (
      this.feeRangeFilter !== 'ALL'
    ) {

      result =
        result.filter(
          fee => {

            const amount =
              Number(fee.payableAmount);


            switch (
            this.feeRangeFilter
            ) {

              case '0_10000':

                return amount >= 0 &&
                  amount < 10000;


              case '10000_25000':

                return amount >= 10000 &&
                  amount < 25000;


              case '25000_PLUS':

                return amount >= 25000;


              default:

                return true;

            }

          }
        );

    }


    // ===================================================
    // SORT
    // ===================================================

    if (
      this.sortField !== 'NONE'
    ) {

      result.sort(
        (a, b) => {

          let comparison = 0;


          switch (
          this.sortField
          ) {

            case 'STUDENT_NAME':

              comparison =
                (a.studentName ?? '')
                  .localeCompare(
                    b.studentName ?? '',
                    undefined,
                    {
                      sensitivity: 'base'
                    }
                  );

              break;


            case 'PAYABLE_AMOUNT':

              comparison =
                Number(a.payableAmount) -
                Number(b.payableAmount);

              break;


            case 'PAID_AMOUNT':

              comparison =
                Number(a.paidAmount) -
                Number(b.paidAmount);

              break;


            case 'REMAINING_AMOUNT':

              comparison =
                Number(a.remainingAmount) -
                Number(b.remainingAmount);

              break;

          }


          return this.sortDirection === 'ASC'
            ? comparison
            : -comparison;

        }
      );

    }


    return result;

  }


  // =====================================================
  // TOTAL PAYABLE
  // =====================================================

  get totalPayable(): number {

    return this.filteredStudentFees.reduce(
      (total, fee) =>
        total + Number(fee.payableAmount),
      0
    );

  }


  // =====================================================
  // TOTAL PAID
  // =====================================================

  get totalPaid(): number {

    return this.filteredStudentFees.reduce(
      (total, fee) =>
        total + Number(fee.paidAmount),
      0
    );

  }


  // =====================================================
  // TOTAL REMAINING
  // =====================================================

  get totalRemaining(): number {

    return this.filteredStudentFees.reduce(
      (total, fee) =>
        total + Number(fee.remainingAmount),
      0
    );

  }


  // =====================================================
  // SEARCH CHANGE
  // =====================================================

  onSearchChange(): void {

    this.cdr.detectChanges();

  }


  // =====================================================
  // STATUS CHANGE
  // =====================================================

  onStatusFilterChange(): void {

    this.cdr.detectChanges();

  }


  // =====================================================
  // FEE RANGE CHANGE
  // =====================================================

  onFeeRangeChange(): void {

    this.cdr.detectChanges();

  }


  // =====================================================
  // SORT CHANGE
  // =====================================================

  onSortChange(): void {

    if (
      this.sortField === 'NONE'
    ) {

      this.sortDirection = 'ASC';

    }

    this.cdr.detectChanges();

  }


  // =====================================================
  // SORT DIRECTION
  // =====================================================

  toggleSortDirection(): void {

    if (
      this.sortField === 'NONE'
    ) {

      return;

    }

    this.sortDirection =
      this.sortDirection === 'ASC'
        ? 'DESC'
        : 'ASC';

    this.cdr.detectChanges();

  }


  // =====================================================
  // RESET FILTERS
  // =====================================================

  resetFilters(): void {

    // Reset server-side filters
    this.academicYearFilter = 'ALL';
    this.classFilter = 'ALL';

    // Reset client-side filters
    this.searchTerm = '';
    this.statusFilter = 'ALL';
    this.feeRangeFilter = 'ALL';

    // Reset sorting
    this.sortField = 'NONE';
    this.sortDirection = 'ASC';

    // Show all classes
    this.filterClassesByYear();

    // Reload all student fees
    this.loadStudentFees();

  }


  // =====================================================
  // STATUS CLASS
  // =====================================================

  getStatusClass(
    status: string
  ): string {

    switch (status) {

      case 'PAID':
        return 'status-paid';

      case 'REMAINING':
        return 'status-remaining';

      default:
        return 'status-unpaid';

    }

  }


  // =====================================================
  // VIEW STUDENT FEE
  // =====================================================

  viewStudentFee(
    fee: StudentFee
  ): void {

    this.closeActionMenu();

    this.router.navigate([
      '/admin/fees/student-fees',
      fee.id
    ]);

  }


  // =====================================================
  // EDIT STUDENT FEE
  // =====================================================

  editStudentFee(
    fee: StudentFee
  ): void {

    this.closeActionMenu();

    this.router.navigate([
      '/admin/fees/student-fees',
      fee.id,
      'edit'
    ]);

  }


  // =====================================================
  // ADD PAYMENT
  // =====================================================

  addPayment(
    fee: StudentFee
  ): void {

    this.closeActionMenu();

    if (fee.remainingAmount <= 0) {
      return;
    }

    this.router.navigate([
      '/admin/fees/student-fees',
      fee.id,
      'payment'
    ]);

  }


  // =====================================================
  // VIEW RECEIPTS
  // =====================================================

  viewReceipts(
    fee: StudentFee
  ): void {

    this.closeActionMenu();

    this.router.navigate([
      '/admin/fees/student-fees',
      fee.id,
      'receipts'
    ]);

  }


  // =====================================================
  // ACTION MENU
  // =====================================================

  openActionMenuId: number | null = null;


  toggleActionMenu(
    feeId: number
  ): void {

    this.openActionMenuId =
      this.openActionMenuId === feeId
        ? null
        : feeId;

  }


  closeActionMenu(): void {

    this.openActionMenuId = null;

  }

}