import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { StudentAttendanceComponent } from './student-attendance';
import { StudentAttendance } from '../services/student-attendance';

describe('StudentAttendanceComponent', () => {
  let component: StudentAttendanceComponent;
  let fixture: ComponentFixture<StudentAttendanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentAttendanceComponent],
      providers: [
        {
          provide: StudentAttendance,
          useValue: {
            getMyAttendancePage: () => of({
              success: true,
              message: 'ok',
              data: {
                content: [{ status: 'PRESENT' }],
                page: 0,
                size: 50,
                totalElements: 1,
                totalPages: 1
              }
            }),
            getMyAttendanceSummary: () => of({
              success: true,
              message: 'ok',
              data: {
                totalRecords: 50,
                presentDays: 42,
                absentDays: 8,
                attendancePercentage: 84
              }
            })
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StudentAttendanceComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders summary totals independently of the current page content', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('84%');
    expect(fixture.nativeElement.textContent).toContain('42');
    expect(fixture.nativeElement.textContent).toContain('8');
  });
});
