import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherDetails } from './teacher-details';

describe('TeacherDetails', () => {
  let component: TeacherDetails;
  let fixture: ComponentFixture<TeacherDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeacherDetails],
    }).compileComponents();

    fixture = TestBed.createComponent(TeacherDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
