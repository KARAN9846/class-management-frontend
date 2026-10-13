import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '../../../../core/services/api.service';
import {
  StudentExamApiResponse,
  StudentExamResult
} from '../models/student-exam.model';

@Injectable({ providedIn: 'root' })
export class StudentExamService {
  private readonly api = inject(ApiService);

  getMyExams(): Observable<StudentExamApiResponse<StudentExamResult[]>> {
    return this.api.get<StudentExamApiResponse<StudentExamResult[]>>(
      '/student/exams/my'
    );
  }
}
