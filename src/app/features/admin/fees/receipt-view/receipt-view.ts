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
  selector: 'app-receipt-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './receipt-view.html',
  styleUrl: './receipt-view.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReceiptViewComponent implements OnInit {
  private readonly receiptService = inject(ReceiptService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  receipt: FeeReceipt | null = null;
  loading = false;
  errorMessage = '';

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id) {
      this.errorMessage = 'Invalid receipt.';
      return;
    }

    this.loadReceipt(id);
  }

    goBack(): void {
    this.router.navigate(['/admin/fees/student-fees']);
  }

  loadReceipt(id: number): void {
    this.loading = true;
    this.errorMessage = '';

    this.receiptService.getById(id).subscribe({
      next: (receipt) => {
        this.receipt = receipt;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage =
          error?.error?.message || 'Failed to load receipt.';
        this.cdr.detectChanges();
      }
    });
  }

  getMediaUrl(path: string | null): string {
    if (!path) {
      return '';
    }

    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }

    const normalizedPath = path.startsWith('/')
      ? path
      : `/${path}`;

    return `http://localhost:8080${normalizedPath}`;
  }

downloadPdf(): void {
  if (!this.receipt) {
    return;
  }

  this.receiptService.downloadPdf(this.receipt.id).subscribe({
    next: (blob) => {
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `receipt-${this.receipt!.receiptNumber}.pdf`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    },

error: async (error) => {
  console.error('PDF download error:', error);

  let message = 'Failed to download receipt PDF.';

  try {
    if (error?.error instanceof Blob) {
      const text = await error.error.text();
      console.error('PDF backend response:', text);

      const data = JSON.parse(text);

      message =
        data?.message ||
        message;
    } else {
      message =
        error?.error?.message ||
        error?.message ||
        message;
    }
  } catch (parseError) {
    console.error('Failed to parse PDF error response:', parseError);
  }

  this.errorMessage = message;
  this.cdr.detectChanges();
}
  });
}


}