import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { ApiService } from '../../../../core/services/api.service';
import { API_ENDPOINTS } from '../../../../core/constants/api-endpoints';

import {
  ReceiptSettings,
  UpdateReceiptSettingsRequest
} from '../models/receipt-settings.model';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class ReceiptSettingsService {

  private readonly api = inject(ApiService);

  getSettings(): Observable<ReceiptSettings> {
    return this.api
      .get<ApiResponse<ReceiptSettings>>(
        API_ENDPOINTS.RECEIPT_SETTINGS.BASE
      )
      .pipe(
        map(response => response.data)
      );
  }

  updateSettings(
    request: UpdateReceiptSettingsRequest
  ): Observable<ReceiptSettings> {
    return this.api
      .put<ApiResponse<ReceiptSettings>>(
        API_ENDPOINTS.RECEIPT_SETTINGS.BASE,
        request
      )
      .pipe(
        map(response => response.data)
      );
  }

  uploadLogo(file: File): Observable<ReceiptSettings> {
    return this.uploadMedia(
      API_ENDPOINTS.RECEIPT_SETTINGS.MEDIA.LOGO,
      file
    );
  }

  uploadSignature(file: File): Observable<ReceiptSettings> {
    return this.uploadMedia(
      API_ENDPOINTS.RECEIPT_SETTINGS.MEDIA.SIGNATURE,
      file
    );
  }

  uploadStamp(file: File): Observable<ReceiptSettings> {
    return this.uploadMedia(
      API_ENDPOINTS.RECEIPT_SETTINGS.MEDIA.STAMP,
      file
    );
  }

  uploadBadge(file: File): Observable<ReceiptSettings> {
    return this.uploadMedia(
      API_ENDPOINTS.RECEIPT_SETTINGS.MEDIA.BADGE,
      file
    );
  }

  private uploadMedia(
    endpoint: string,
    file: File
  ): Observable<ReceiptSettings> {

    const formData = new FormData();
    formData.append('file', file);

    return this.api
      .post<ApiResponse<ReceiptSettings>>(
        endpoint,
        formData
      )
      .pipe(
        map(response => response.data)
      );
  }
}