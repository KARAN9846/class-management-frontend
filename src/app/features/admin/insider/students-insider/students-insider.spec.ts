import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcademicYearService } from '../../academic/academic-years/services/academic-year.service';
import { ClassService } from '../../academic/classes/class.service';
import { SectionService } from '../../academic/classes/section.service';
import { AttendanceService } from '../../attendance/services/attendance.service';
import { StudentFeeService } from '../../fees/services/student-fee.service';
import { StudentService } from '../../students/services/student.service';
import { Attendance } from '../../attendance/models/attendance.model';
import { Student } from '../../students/models/student.model';
import { StudentsInsider } from './students-insider';

describe('StudentsInsider', () => {
  let component: StudentsInsider;
  let fixture: ComponentFixture<StudentsInsider>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentsInsider],
      providers: [
        { provide: StudentService, useValue: {} },
        { provide: AttendanceService, useValue: {} },
        { provide: StudentFeeService, useValue: {} },
        { provide: AcademicYearService, useValue: {} },
        { provide: ClassService, useValue: {} },
        { provide: SectionService, useValue: {} }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StudentsInsider);
    component = fixture.componentInstance;
  });

  it('should format student names without displaying surrounding whitespace', () => {
    expect(component.getStudentName({ name: '  Anaya Shah  ' } as Student)).toBe('Anaya Shah');
    expect(component.getStudentName({ name: undefined } as unknown as Student)).toBe('');
  });

  it('should calculate present and absent attendance totals', () => {
    component.reportAttendance = [
      { studentId: 10, status: 'PRESENT' },
      { studentId: 10, status: 'ABSENT' },
      { studentId: 10, status: 'PRESENT' },
      { studentId: 11, status: 'PRESENT' }
    ] as Attendance[];

    expect(component.getStudentAttendance(10)).toEqual({
      percentage: 66.7,
      present: 2,
      absent: 1
    });
  });
});
