import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { TeacherAttendance } from './teacher-attendance';
import { ApiService } from '../../../../core/services/api.service';

describe('TeacherAttendance', () => {
  let service: TeacherAttendance;
  let request: { endpoint: string; params: any } | undefined;

  beforeEach(() => {
    request = undefined;

    TestBed.configureTestingModule({
      providers: [
        TeacherAttendance,
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
    service = TestBed.inject(TeacherAttendance);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('builds the scoped paginated attendance request', () => {
    service.getAttendancePage({
      page: 2,
      size: 50,
      dateFrom: '2026-01-05',
      dateTo: '2026-01-05',
      status: 'ABSENT',
      academicYearId: 4,
      classId: 7,
      sectionId: 8,
      search: 'Asha',
      sortBy: 'attendanceDate',
      sortDirection: 'desc'
    }).subscribe();

    expect(request?.endpoint).toBe('/attendance/teacher/page');
    expect(request?.params.get('page')).toBe('2');
    expect(request?.params.get('size')).toBe('50');
    expect(request?.params.get('dateFrom')).toBe('2026-01-05');
    expect(request?.params.get('dateTo')).toBe('2026-01-05');
    expect(request?.params.get('status')).toBe('ABSENT');
    expect(request?.params.get('academicYearId')).toBe('4');
    expect(request?.params.get('classId')).toBe('7');
    expect(request?.params.get('sectionId')).toBe('8');
    expect(request?.params.get('search')).toBe('Asha');
    expect(request?.params.get('sortBy')).toBe('attendanceDate');
    expect(request?.params.get('sortDirection')).toBe('desc');
  });
});
