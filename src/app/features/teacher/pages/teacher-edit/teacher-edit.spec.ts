import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherEdit } from './teacher-edit';

describe('TeacherEdit', () => {
  let component: TeacherEdit;
  let fixture: ComponentFixture<TeacherEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeacherEdit],
    }).compileComponents();

    fixture = TestBed.createComponent(TeacherEdit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
