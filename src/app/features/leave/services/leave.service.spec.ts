import { HttpParams } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { ApiService } from '../../../core/services/api.service';
import { LeaveService } from './leave.service';

describe('LeaveService teacher review API', () => {
  let service: LeaveService;
  let api: { get: ReturnType<typeof vi.fn>; post: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    api = { get: vi.fn(), post: vi.fn() };
    api.get.mockReturnValue(of({ success: true, message: 'ok', data: { content: [], number: 0, size: 10, totalElements: 0, totalPages: 0 } }));
    api.post.mockReturnValue(of({ success: true, message: 'ok', data: null }));

    TestBed.configureTestingModule({
      providers: [LeaveService, { provide: ApiService, useValue: api }]
    });
    service = TestBed.inject(LeaveService);
  });

  it('calls the teacher list endpoint with the supported filters', () => {
    service.teacherList(2, 10, {
      q: 'Asha',
      status: 'PENDING',
      leaveStartFrom: '2026-06-01',
      leaveEndTo: '2026-06-30',
      submittedFrom: '2026-05-01',
      submittedTo: '2026-05-31',
      sortBy: 'createdAt',
      sortDirection: 'desc'
    }).subscribe();

    expect(api.get).toHaveBeenCalledWith('/leave-requests/teacher', expect.any(HttpParams));
    const params = api.get.mock.calls[0][1] as HttpParams;
    expect(params.get('page')).toBe('2');
    expect(params.get('size')).toBe('10');
    expect(params.get('q')).toBe('Asha');
    expect(params.get('status')).toBe('PENDING');
    expect(params.get('leaveStartFrom')).toBe('2026-06-01');
    expect(params.get('leaveEndTo')).toBe('2026-06-30');
    expect(params.get('submittedFrom')).toBe('2026-05-01');
    expect(params.get('submittedTo')).toBe('2026-05-31');
    expect(params.get('sortBy')).toBe('createdAt');
    expect(params.get('sortDirection')).toBe('desc');
    expect(params.get('applicantType')).toBeNull();
  });

  it('uses the teacher detail and decision endpoints', () => {
    service.teacherGet(41).subscribe();
    service.teacherApprove(41, {}).subscribe();
    service.teacherReject(41, { comment: 'Not approved' }).subscribe();

    expect(api.get).toHaveBeenCalledWith('/leave-requests/teacher/41');
    expect(api.post).toHaveBeenNthCalledWith(1, '/leave-requests/teacher/41/approve', {});
    expect(api.post).toHaveBeenNthCalledWith(2, '/leave-requests/teacher/41/reject', { comment: 'Not approved' });
  });
});
