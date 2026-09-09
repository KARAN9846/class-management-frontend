import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { ReceiptService } from '../services/receipt.service';
import { FeeReceipt } from '../models/fee-receipt.model';

@Component({
  selector: 'app-receipt-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './receipt-list.html',
  styleUrl: './receipt-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReceiptListComponent implements OnInit {

  private readonly receiptService = inject(ReceiptService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  studentFeeId!: number;

  receipts: FeeReceipt[] = [];

  selectedReceipt: FeeReceipt | null = null;

  loading = false;
  errorMessage = '';

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id) {
      this.errorMessage = 'Invalid student fee.';
      return;
    }

    this.studentFeeId = id;
    this.loadReceipts();
  }

  loadReceipts(): void {
    this.loading = true;
    this.errorMessage = '';

    this.receiptService.getByStudentFee(this.studentFeeId).subscribe({
      next: (receipts) => {
        this.receipts = receipts;
        this.loading = false;
        this.cdr.detectChanges();
      },

      error: (error) => {
        this.loading = false;

        this.errorMessage =
          error?.error?.message ||
          'Failed to load receipt history.';

        this.cdr.detectChanges();
      }
    });
  }

  viewReceipt(receipt: FeeReceipt): void {
    this.selectedReceipt = receipt;
    this.cdr.detectChanges();
  }

  closeReceipt(): void {
    this.selectedReceipt = null;
    this.cdr.detectChanges();
  }

  downloadReceipt(receipt: FeeReceipt): void {
    this.receiptService.downloadPdf(receipt.id).subscribe({
      next: (blob) => {

        const url = window.URL.createObjectURL(blob);

        const link = document.createElement('a');

        link.href = url;
        link.download = `receipt-${receipt.receiptNumber}.pdf`;

        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);

        window.URL.revokeObjectURL(url);
      },

      error: (error) => {
        console.error(
          'Failed to download receipt:',
          error
        );

        this.errorMessage =
          error?.error?.message ||
          'Failed to download receipt.';

        this.cdr.detectChanges();
      }
    });
  }

  getReceiptImageUrl(path: string | null): string | null {
    if (!path) {
      return null;
    }

    return `http://localhost:8080/${path.replace(/\\/g, '/')}`;
  }

  goBack(): void {
    this.router.navigate([
      '/admin/fees/student-fees',
      this.studentFeeId
    ]);
  }
}