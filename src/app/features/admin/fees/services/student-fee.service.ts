import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiResponse } from '../models/fee-structure.model';
import { StudentFee } from '../models/student-fee.model';
import { FeePayment } from '../models/fee-payment.model';

import { ApiService } from '../../../../core/services/api.service';
import { API_ENDPOINTS } from '../../../../core/constants/api-endpoints';

@Injectable({
  providedIn: 'root'
})
export class StudentFeeService {

  private readonly api = inject(ApiService);

  getAll(academicYearId?: number): Observable<ApiResponse<StudentFee[]>> {

    let params = new HttpParams();

    if (academicYearId !== undefined) {
      params = params.set('academicYearId', academicYearId);
    }

    return this.api.get<ApiResponse<StudentFee[]>>(
      API_ENDPOINTS.STUDENT_FEES.BASE,
      params
    );
  }

  getByClass(
    academicYearId: number,
    classId: number
  ): Observable<ApiResponse<StudentFee[]>> {

    const params = new HttpParams()
      .set('academicYearId', academicYearId)
      .set('classId', classId);

    return this.api.get<ApiResponse<StudentFee[]>>(
      API_ENDPOINTS.STUDENT_FEES.BY_CLASS,
      params
    );
  }

  getById(id: number): Observable<StudentFee> {

    return this.api.get<StudentFee>(
      API_ENDPOINTS.STUDENT_FEES.BY_ID(id)
    );
  }

  getPayments(studentFeeId: number): Observable<FeePayment[]> {

    return this.api.get<FeePayment[]>(
      API_ENDPOINTS.FEE_PAYMENTS.BY_STUDENT_FEE(studentFeeId)
    );
  }

  update(
  id: number,
  request: {
    discountType: string;
    discountValue: number;
  }
): Observable<StudentFee> {

  return this.api.put<StudentFee>(
    API_ENDPOINTS.STUDENT_FEES.BY_ID(id),
    request
  );
}
}