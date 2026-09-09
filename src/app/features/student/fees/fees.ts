import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { FeeReceipt } from '../../admin/fees/models/fee-receipt.model';
import { ReceiptService } from '../../admin/fees/services/receipt.service';
import { StudentFeeService } from '../../admin/fees/services/student-fee.service';
import { StudentFee } from '../../admin/fees/models/student-fee.model';
import { FeePayment } from '../../admin/fees/models/fee-payment.model';

@Component({
  selector: 'app-student-fees',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './fees.html',
  styleUrl: './fees.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StudentFeesComponent {


  getReceiptImageUrl(path: string | null): string | null {
  if (!path) {
    return null;
  }

  return `http://localhost:8080/${path.replace(/\\/g, '/')}`;
}

  private readonly studentFeeService = inject(StudentFeeService);
  private readonly cdr = inject(ChangeDetectorRef);
  readonly receiptService = inject(ReceiptService);

  fees: StudentFee[] = [];
  selectedFee: StudentFee | null = null;

  payments: FeePayment[] = [];
  receipt: FeeReceipt | null = null;

  loading = false;
  paymentsLoading = false;
  receiptLoading = false;

  showReceipt = false;

  errorMessage = '';

  ngOnInit(): void {
    this.loadFees();
  }

  loadFees(): void {
    this.loading = true;
    this.errorMessage = '';

    this.studentFeeService.getMyFees().subscribe({
      next: (response) => {
        this.fees = response;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Unable to load your fees.';
        this.cdr.markForCheck();
      }
    });
  }

  viewPayments(fee: StudentFee): void {
    this.selectedFee = fee;
    this.payments = [];
    this.showReceipt = false;
    this.receipt = null;
    this.paymentsLoading = true;

    this.studentFeeService.getMyPayments(fee.id).subscribe({
      next: (response) => {
        this.payments = response;
        this.paymentsLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.paymentsLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  closePayments(): void {
    this.selectedFee = null;
    this.payments = [];
  }

viewReceiptForPayment(payment: FeePayment): void {

  
  this.receipt = null;
  this.showReceipt = true;
  this.receiptLoading = true;

  this.receiptService.getMyByStudentFee(payment.studentFeeId).subscribe({
    next: (receipts) => {
      this.receipt =
        receipts.find(receipt => receipt.paymentId === payment.id) ?? null;

      this.receiptLoading = false;
      this.cdr.markForCheck();
    },
    error: () => {
      this.receiptLoading = false;
      this.cdr.markForCheck();
    }
  });
}

  closeReceipt(): void {
    this.showReceipt = false;
    this.receipt = null;
  }

  downloadReceipt(): void {
  if (!this.receipt) {
    return;
  }

  this.receiptService.downloadMyPdf(this.receipt.id).subscribe({
    next: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = `receipt-${this.receipt!.id}.pdf`;
      link.click();

      window.URL.revokeObjectURL(url);
    }
  });
}

  getStatusClass(status: string): string {
    return status.toLowerCase();
  }
}