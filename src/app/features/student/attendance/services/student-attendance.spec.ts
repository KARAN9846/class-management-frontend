import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { StudentAttendance } from './student-attendance';
import { ApiService } from '../../../../core/services/api.service';

describe('StudentAttendance', () => {
  let service: StudentAttendance;
  let request: { endpoint: string; params: any } | undefined;

  beforeEach(() => {
    request = undefined;

    TestBed.configureTestingModule({
      providers: [
        StudentAttendance,
        {
          provide: ApiService,
          useValue: {
            get: (endpoint: string, params: any) => {
              request = { endpoint, params };
              return of({
                success: true,
                message: 'ok',
                data: {
                  content: [],
                  page: 0,
                  size: 50,
                  totalElements: 0,
                  totalPages: 0
                }
              });
            }
          }
        }
      ]
    });
    service = TestBed.inject(StudentAttendance);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('builds an authenticated student page request without a student id', () => {
    service.getMyAttendancePage({
      page: 1,
      size: 50,
      search: '2026',
      sortBy: 'attendanceDate',
      sortDirection: 'desc'
    }).subscribe();

    expect(request?.endpoint).toBe('/attendance/my/page');
    expect(request?.params.get('page')).toBe('1');
    expect(request?.params.get('size')).toBe('50');
    expect(request?.params.get('search')).toBe('2026');
    expect(request?.params.get('sortBy')).toBe('attendanceDate');
    expect(request?.params.get('sortDirection')).toBe('desc');
    expect(request?.params.keys()).not.toContain('studentId');
  });

  it('uses the authenticated summary endpoint without query parameters', () => {
    service.getMyAttendanceSummary().subscribe();

    expect(request?.endpoint).toBe('/attendance/my/summary');
    expect(request?.params).toBeUndefined();
  });
});
