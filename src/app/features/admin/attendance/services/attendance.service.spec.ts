import { HttpParams } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { ApiService } from '../../../../core/services/api.service';
import {
  AttendancePageQuery,
  AttendancePageResponse
} from '../models/attendance.model';
import { AttendanceService } from './attendance.service';

describe('AttendanceService', () => {
  let service: AttendanceService;
  let api: { get: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    api = { get: vi.fn() };
    api.get.mockReturnValue(of({
      success: true,
      message: 'Success',
      data: {
        content: [],
        page: 0,
        size: 50,
        totalElements: 0,
        totalPages: 0
      } satisfies AttendancePageResponse
    }));

    TestBed.configureTestingModule({
      providers: [
        AttendanceService,
        { provide: ApiService, useValue: api }
      ]
    });

    service = TestBed.inject(AttendanceService);
  });

  it('calls the paginated admin endpoint with supported query parameters', () => {
    const query: AttendancePageQuery = {
      page: 2,
      size: 50,
      dateFrom: '2026-01-01',
      dateTo: '2026-01-31',
      status: 'ABSENT',
      academicYearId: 4,
      classId: 8,
      sectionId: 12,
      search: 'Asha',
      sortBy: 'studentName',
      sortDirection: 'asc'
    };

    service.getAttendancePage(query).subscribe();

    expect(api.get).toHaveBeenCalledWith(
      '/attendance/page',
      expect.any(HttpParams)
    );

    const params = api.get.mock.calls[0][1] as HttpParams;
    expect(params.get('page')).toBe('2');
    expect(params.get('size')).toBe('50');
    expect(params.get('dateFrom')).toBe('2026-01-01');
    expect(params.get('dateTo')).toBe('2026-01-31');
    expect(params.get('status')).toBe('ABSENT');
    expect(params.get('academicYearId')).toBe('4');
    expect(params.get('classId')).toBe('8');
    expect(params.get('sectionId')).toBe('12');
    expect(params.get('search')).toBe('Asha');
    expect(params.get('sortBy')).toBe('studentName');
    expect(params.get('sortDirection')).toBe('asc');
  });

  it('does not send empty optional filters', () => {
    service.getAttendancePage({
      page: 0,
      size: 50,
      sortBy: 'attendanceDate',
      sortDirection: 'desc'
    }).subscribe();

    const params = api.get.mock.calls[0][1] as HttpParams;
    expect(params.keys()).toEqual([
      'page',
      'size',
      'sortBy',
      'sortDirection'
    ]);
  });
});
