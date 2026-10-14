import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';

import { TeacherDetails } from './teacher-details';
import { TeacherService } from '../services/teacher.service';
import { TeacherRoleAssignmentService } from '../../teacher-role-assignments/services/teacher-role-assignment.service';
import { TeacherRoleService } from '../../teacher-roles/services/teacher-role.service';

describe('TeacherDetails', () => {
  let component: TeacherDetails;
  let fixture: ComponentFixture<TeacherDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeacherDetails],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({}) } }
        },
        { provide: Router, useValue: { navigate: vi.fn() } },
        { provide: TeacherService, useValue: {} },
        { provide: TeacherRoleAssignmentService, useValue: {} },
        { provide: TeacherRoleService, useValue: {} }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TeacherDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should show an invalid-id message when no route id is provided', () => {
    expect(component).toBeTruthy();
    expect(component.errorMessage).toBe('Invalid teacher ID.');
  });
});
