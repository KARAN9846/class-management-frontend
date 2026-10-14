import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherAttendanceComponent } from './teacher-attendance';

describe('TeacherAttendanceComponent', () => {
  let component: TeacherAttendanceComponent;
  let fixture: ComponentFixture<TeacherAttendanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeacherAttendanceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TeacherAttendanceComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
