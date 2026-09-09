import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { ApiService } from '../../../../core/services/api.service';
import { FeeReceipt } from '../models/fee-receipt.model';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class ReceiptService {

  private readonly api = inject(ApiService);

  getByStudentFee(studentFeeId: number): Observable<FeeReceipt[]> {
    return this.api
      .get<ApiResponse<FeeReceipt[]>>(
        `/student-fees/${studentFeeId}/receipts`
      )
      .pipe(
        map(response => response.data)
      );
  }

  getById(receiptId: number): Observable<FeeReceipt> {
    return this.api
      .get<ApiResponse<FeeReceipt>>(
        `/fee-receipts/${receiptId}`
      )
      .pipe(
        map(response => response.data)
      );
  }

  getPdfUrl(receiptId: number): string {
    return `/api/v1/fee-receipts/${receiptId}/pdf`;
  }

downloadPdf(receiptId: number): Observable<Blob> {
  return this.api.getBlob(
    `/fee-receipts/${receiptId}/pdf`
  );
}

getMyByStudentFee(studentFeeId: number): Observable<FeeReceipt[]> {
  return this.api
    .get<ApiResponse<FeeReceipt[]>>(
      `/student-fees/my/${studentFeeId}/receipts`
    )
    .pipe(
      map(response => response.data)
    );
}

getMyById(receiptId: number): Observable<FeeReceipt> {
  return this.api
    .get<ApiResponse<FeeReceipt>>(
      `/student/fee-receipts/${receiptId}`
    )
    .pipe(
      map(response => response.data)
    );
}

getMyPdfUrl(receiptId: number): string {
  return `/api/v1/student/fee-receipts/${receiptId}/pdf`;
}

downloadMyPdf(receiptId: number): Observable<Blob> {
  return this.api.getBlob(
    `/student/fee-receipts/${receiptId}/pdf`
  );
}
}