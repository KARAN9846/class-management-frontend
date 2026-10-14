import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentAttendanceComponent } from './student-attendance';

describe('StudentAttendanceComponent', () => {
  let component: StudentAttendanceComponent;
  let fixture: ComponentFixture<StudentAttendanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentAttendanceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentAttendanceComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
