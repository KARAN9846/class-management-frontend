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
import { environment } from '../../../../../environments/environment';

import {
  DataTableComponent,
  TableAction,
  TableColumn
} from '../../../../shared/components/data-table/data-table.component';

@Component({
  selector: 'app-receipt-list',
  standalone: true,
  imports: [
    CommonModule,
    DataTableComponent
  ],
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

  columns: TableColumn[] = [
    {
      key: 'receiptNumber',
      label: 'Receipt No.',
      sortable: true
    },
    {
      key: 'issuedAt',
      label: 'Date',
      sortable: true,
      value: (row: FeeReceipt) =>
        new Date(row.issuedAt).toLocaleString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }),
      sortValue: (row: FeeReceipt) =>
        new Date(row.issuedAt).getTime()
    },
    {
      key: 'studentName',
      label: 'Student',
      sortable: true
    },
    {
      key: 'paymentAmount',
      label: 'Payment',
      align: 'right',
      sortable: true,
      value: (row: FeeReceipt) =>
        `₹${row.paymentAmount.toLocaleString('en-IN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })}`,
      sortValue: (row: FeeReceipt) =>
        row.paymentAmount
    },
    {
      key: 'paymentMethod',
      label: 'Method',
      sortable: true
    },
    {
      key: 'totalPaidAmount',
      label: 'Total Paid',
      align: 'right',
      sortable: true,
      value: (row: FeeReceipt) =>
        `₹${row.totalPaidAmount.toLocaleString('en-IN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })}`,
      sortValue: (row: FeeReceipt) =>
        row.totalPaidAmount
    },
    {
      key: 'remainingAmount',
      label: 'Remaining',
      align: 'right',
      sortable: true,
      value: (row: FeeReceipt) =>
        `₹${row.remainingAmount.toLocaleString('en-IN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })}`,
      sortValue: (row: FeeReceipt) =>
        row.remainingAmount
    }
  ];

  actions: TableAction[] = [
    {
      label: 'View',
      type: 'view'
    },
    {
      label: 'Download',
      type: 'download'
    }
  ];

  selectedReceipt: FeeReceipt | null = null;

  loading = false;
  errorMessage = '';

  ngOnInit(): void {
    const id = Number(
      this.route.snapshot.paramMap.get('id')
    );

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

    this.receiptService
      .getByStudentFee(this.studentFeeId)
      .subscribe({
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
    this.receiptService
      .downloadPdf(receipt.id)
      .subscribe({
        next: (blob) => {

          const url =
            window.URL.createObjectURL(blob);

          const link =
            document.createElement('a');

          link.href = url;
          link.download =
            `receipt-${receipt.receiptNumber}.pdf`;

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

  getReceiptImageUrl(
    path: string | null
  ): string | null {

    if (!path) {
      return null;
    }

    return `${
      environment.apiBaseUrl.replace('/api/v1', '')
    }/${path.replace(/\\/g, '/')}`;
  }

  goBack(): void {
    this.router.navigate([
      '/admin/fees/student-fees'
    ]);
  }

  onActionClick(event: {
    action: TableAction;
    row: FeeReceipt;
  }): void {

    const { action, row } = event;

    switch (action.type) {

      case 'view':
        this.viewReceipt(row);
        break;

      case 'download':
        this.downloadReceipt(row);
        break;
    }
  }
}