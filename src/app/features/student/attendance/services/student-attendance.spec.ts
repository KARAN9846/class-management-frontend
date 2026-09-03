import { TestBed } from '@angular/core/testing';

import { StudentAttendance } from './student-attendance';

describe('StudentAttendance', () => {
  let service: StudentAttendance;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StudentAttendance);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
