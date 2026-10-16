
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { StudentDashboard } from './student-dashboard';
import { ProfileService } from '../../../../core/services/profile.service';
import { StudentAttendance } from '../../attendance/services/student-attendance';
import { StudentFeeService } from '../../../admin/fees/services/student-fee.service';

describe('StudentDashboard', () => {
  let component: StudentDashboard;
  let fixture: ComponentFixture<StudentDashboard>;

  const profileServiceMock = {
    getMyProfile: () =>
      of({
        success: true,
        message: 'Profile loaded',
        data: {
          id: 1,
          firstName: 'Test',
          lastName: 'Student',
          email: 'student@example.com',
          role: 'STUDENT',
          isActive: true,
          phone: null,
          rollNumber: null,
          teacherNumber: null,
          enrollmentNumber: null,
          academicYear: null,
          className: null,
          section: null,
        },
      }),
  };

  const attendanceServiceMock = {
    getMyAttendance: () =>
      of({
        success: true,
        message: 'Attendance loaded',
        data: [],
      }),
  };

  const studentFeeServiceMock = {
    getMyFees: () => of([]),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentDashboard],
      providers: [
        { provide: ProfileService, useValue: profileServiceMock },
        { provide: StudentAttendance, useValue: attendanceServiceMock },
        { provide: StudentFeeService, useValue: studentFeeServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load profile, attendance, and fees from mocked services', () => {
    expect(component.profile?.firstName).toBe('Test');
    expect(component.attendance).toEqual([]);
    expect(component.fees).toEqual([]);
    expect(component.loading).toBe(false);
  });
});
