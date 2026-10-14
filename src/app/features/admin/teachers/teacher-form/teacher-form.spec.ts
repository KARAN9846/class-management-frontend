import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';

import { TeacherForm } from './teacher-form';
import { TeacherService } from '../services/teacher.service';

describe('TeacherForm', () => {
  let component: TeacherForm;
  let fixture: ComponentFixture<TeacherForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeacherForm],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({}) } }
        },
        { provide: Router, useValue: { navigate: vi.fn() } },
        { provide: TeacherService, useValue: {} }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TeacherForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should initialize in create mode without a route id', () => {
    expect(component).toBeTruthy();
    expect(component.editing).toBe(false);
    expect(component.teacherId).toBeNull();
  });
});
