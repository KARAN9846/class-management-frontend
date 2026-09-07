import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ConfirmationDialogComponent } from '../../../../shared/components/confirmation-dialog/confirmation-dialog.component';

import { StudentFeeService } from '../services/student-fee.service';
import { StudentFee } from '../models/student-fee.model';
import { FeePayment } from '../models/fee-payment.model';

@Component({
  selector: 'app-student-fee-view',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ConfirmationDialogComponent
  ],
  templateUrl: './student-fee-view.html',
  styleUrl: './student-fee-view.scss'
})
export class StudentFeeView implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly studentFeeService = inject(StudentFeeService);
  private readonly cdr = inject(ChangeDetectorRef);

  studentFee: StudentFee | null = null;
  payments: FeePayment[] = [];

  loading = true;
  paymentsLoading = false;

  saving = false;

  errorMessage = '';
  paymentsErrorMessage = '';

  isEditing = false;
  showConfirmation = false;

  editDiscountType = 'NONE';
  editDiscountValue: number | null = 0;

  ngOnInit(): void {
    const id = Number(
      this.route.snapshot.paramMap.get('id')
    );

    if (!id) {
      this.errorMessage = 'Invalid student fee ID.';
      this.loading = false;
      this.cdr.detectChanges();
      return;
    }

    this.loadStudentFee(id);
  }

  private loadStudentFee(id: number): void {
    this.loading = true;
    this.errorMessage = '';

    this.studentFeeService.getById(id).subscribe({

      next: (response: any) => {

        this.studentFee = response?.data ?? response;
        this.loading = false;

        const isEditRoute =
          this.route.snapshot.url.some(
            segment => segment.path === 'edit'
          );

        if (isEditRoute && this.studentFee) {
          this.startEdit();
        }

        this.loadPayments(id);

        this.cdr.detectChanges();
      },

      error: (error) => {

        console.error(
          'Failed to load student fee:',
          error
        );

        this.errorMessage =
          error?.error?.message ||
          error?.message ||
          'Failed to load student fee.';

        this.loading = false;

        this.cdr.detectChanges();
      }
    });
  }

  private loadPayments(studentFeeId: number): void {
    this.paymentsLoading = true;
    this.paymentsErrorMessage = '';

    this.studentFeeService
      .getPayments(studentFeeId)
      .subscribe({

        next: (response: any) => {

          this.payments =
            response?.data ??
            response ??
            [];

          this.paymentsLoading = false;

          this.cdr.detectChanges();
        },

        error: (error) => {

          console.error(
            'Failed to load payment history:',
            error
          );

          this.paymentsErrorMessage =
            error?.error?.message ||
            error?.message ||
            'Failed to load payment history.';

          this.paymentsLoading = false;

          this.cdr.detectChanges();
        }
      });
  }

  startEdit(): void {
    if (!this.studentFee) {
      return;
    }

    this.editDiscountType =
      this.studentFee.discountType;

    this.editDiscountValue =
      this.studentFee.discountValue;

    this.errorMessage = '';
    this.isEditing = true;

    this.cdr.detectChanges();
  }

  cancelEdit(): void {
    if (this.studentFee) {

      this.editDiscountType =
        this.studentFee.discountType;

      this.editDiscountValue =
        this.studentFee.discountValue;
    }

    this.errorMessage = '';
    this.isEditing = false;

    this.cdr.detectChanges();
  }

  onDiscountTypeChange(): void {
    this.errorMessage = '';

    if (this.editDiscountType === 'NONE') {
      this.editDiscountValue = 0;
    }

    this.cdr.detectChanges();
  }

  get calculatedDiscountAmount(): number {
    if (!this.studentFee) {
      return 0;
    }

    const value = Number(this.editDiscountValue ?? 0);

    if (value <= 0) {
      return 0;
    }

    if (this.editDiscountType === 'PERCENTAGE') {
      return this.roundMoney(
        this.studentFee.originalAmount * value / 100
      );
    }

    if (this.editDiscountType === 'FIXED_AMOUNT') {
      return this.roundMoney(value);
    }

    return 0;
  }

  get calculatedPayableAmount(): number {
    if (!this.studentFee) {
      return 0;
    }

    return this.roundMoney(
      Math.max(
        0,
        this.studentFee.originalAmount -
        this.calculatedDiscountAmount
      )
    );
  }

  get calculatedRemainingAmount(): number {
    if (!this.studentFee) {
      return 0;
    }

    return this.roundMoney(
      Math.max(
        0,
        this.calculatedPayableAmount -
        Number(this.studentFee.paidAmount ?? 0)
      )
    );
  }

  get calculatedDiscountPercentage(): number {
    if (!this.studentFee || this.studentFee.originalAmount <= 0) {
      return 0;
    }

    return this.roundMoney(
      (this.calculatedDiscountAmount /
        this.studentFee.originalAmount) *
      100
    );
  }

  private roundMoney(value: number): number {
    return Math.round(
      (Number(value) + Number.EPSILON) * 100
    ) / 100;
  }

  saveEdit(): void {
    this.errorMessage = '';

    if (!this.studentFee) {
      this.errorMessage =
        'Student fee information is not available.';
      this.cdr.detectChanges();
      return;
    }

    if (!this.editDiscountType) {
      this.errorMessage =
        'Discount type is required.';
      this.cdr.detectChanges();
      return;
    }

    if (
      this.editDiscountValue === null ||
      this.editDiscountValue === undefined ||
      Number.isNaN(Number(this.editDiscountValue))
    ) {
      this.errorMessage =
        'Discount value is required.';
      this.cdr.detectChanges();
      return;
    }

    const discountValue =
      Number(this.editDiscountValue);

    if (discountValue < 0) {
      this.errorMessage =
        'Discount value cannot be negative.';
      this.cdr.detectChanges();
      return;
    }

    if (
      this.editDiscountType === 'NONE' &&
      discountValue !== 0
    ) {
      this.errorMessage =
        'Discount value must be 0 when discount type is NONE.';
      this.cdr.detectChanges();
      return;
    }

    if (
      this.editDiscountType === 'PERCENTAGE' &&
      discountValue > 100
    ) {
      this.errorMessage =
        'Percentage discount cannot exceed 100%.';
      this.cdr.detectChanges();
      return;
    }

    if (
      this.editDiscountType === 'FIXED_AMOUNT' &&
      discountValue > this.studentFee.originalAmount
    ) {
      this.errorMessage =
        'Fixed discount cannot exceed the original fee.';
      this.cdr.detectChanges();
      return;
    }

    const alreadyPaid =
      Number(this.studentFee.paidAmount ?? 0);

    if (this.calculatedPayableAmount < alreadyPaid) {
      this.errorMessage =
        `Payable amount cannot be less than the already paid amount of ${this.formatCurrency(alreadyPaid)}.`;
      this.cdr.detectChanges();
      return;
    }

    this.editDiscountValue =
      this.roundMoney(discountValue);

    this.showConfirmation = true;

    this.cdr.detectChanges();
  }

  confirmEdit(): void {
    if (!this.studentFee) {
      return;
    }

    if (
      this.editDiscountValue === null ||
      this.editDiscountValue === undefined
    ) {
      return;
    }

    this.showConfirmation = false;
    this.saving = true;
    this.errorMessage = '';

    const request = {
      discountType: this.editDiscountType,
      discountValue: this.editDiscountValue
    };

    this.studentFeeService
      .update(
        this.studentFee.id,
        request
      )
      .subscribe({

        next: (response: any) => {

          this.studentFee =
            response?.data ?? response;

          this.saving = false;
          this.isEditing = false;

          this.cdr.detectChanges();
        },

        error: (error) => {

          console.error(
            'Update student fee error:',
            error
          );

          this.saving = false;

          this.errorMessage =
            error?.error?.message ||
            error?.message ||
            'Failed to update student fee.';

          this.cdr.detectChanges();
        }
      });
  }

  cancelConfirmation(): void {
    this.showConfirmation = false;

    this.cdr.detectChanges();
  }

  goBack(): void {
    this.router.navigate([
      '/admin/fees/student-fees'
    ]);
  }

  addPayment(): void {
    if (!this.studentFee) {
      return;
    }

    if (this.studentFee.remainingAmount <= 0) {
      return;
    }

    this.router.navigate([
      '/admin/fees/student-fees',
      this.studentFee.id,
      'payment'
    ]);
  }

  formatCurrency(amount: number): string {
    return `₹${Number(amount ?? 0).toLocaleString(
      'en-IN',
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }
    )}`;
  }

  formatPaymentMethod(method: string): string {
    switch (method) {

      case 'BANK_TRANSFER':
        return 'Bank Transfer';

      case 'UPI':
        return 'UPI';

      case 'CASH':
        return 'Cash';

      case 'CARD':
        return 'Card';

      case 'CHEQUE':
        return 'Cheque';

      default:
        return method;
    }
  }

  formatPaymentType(type: string): string {
    switch (type) {

      case 'FULL_PAYMENT':
        return 'Full Payment';

      case 'INSTALLMENT':
        return 'Installment';

      default:
        return type;
    }
  }

  formatDate(date: string): string {
    if (!date) {
      return '-';
    }

    const parts = date.split('-');

    if (parts.length !== 3) {
      return date;
    }

    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
}