import { TestBed } from '@angular/core/testing';

import { TeacherAttendance } from './teacher-attendance';

describe('TeacherAttendance', () => {
  let service: TeacherAttendance;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TeacherAttendance);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
