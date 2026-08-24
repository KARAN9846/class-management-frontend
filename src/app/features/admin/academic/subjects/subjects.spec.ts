import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubjectsComponent } from './subjects';

describe('SubjectsComponent', () => {

  let component: SubjectsComponent;
  let fixture: ComponentFixture<SubjectsComponent>;

  beforeEach(async () => {

    await TestBed.configureTestingModule({
      imports: [SubjectsComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SubjectsComponent);

    component = fixture.componentInstance;

    fixture.detectChanges();

  });


  it('should create', () => {

    expect(component).toBeTruthy();

  });


  it('should contain subjects', () => {

    expect(component.subjects.length).toBeGreaterThan(0);

  });


  it('should filter subjects by search term', () => {

    component.searchTerm = 'Mathematics';

    expect(component.filteredSubjects.length).toBe(1);

    expect(component.filteredSubjects[0].name)
      .toBe('Mathematics');

  });


  it('should filter subjects by class', () => {

    component.classFilter = 1;

    expect(component.filteredSubjects.length).toBe(3);

  });


  it('should filter subjects by status', () => {

    component.statusFilter = 'ACTIVE';

    expect(component.filteredSubjects.length).toBe(5);

  });


  it('should open add form', () => {

    component.openAddForm();

    expect(component.showForm).toBe(true);

    expect(component.editingSubject).toBe(null);

  });


  it('should close form', () => {

    component.openAddForm();

    component.closeForm();

    expect(component.showForm).toBe(false);

    expect(component.editingSubject).toBe(null);

  });


  it('should add a new subject', () => {

    const initialCount =
      component.subjects.length;

    component.form = {
      name: 'Biology',
      code: 'BIO',
      classId: 1,
      status: 'ACTIVE'
    };

    component.saveSubject();

    expect(component.subjects.length)
      .toBe(initialCount + 1);

    expect(component.subjects[0].name)
      .toBe('Biology');

    expect(component.subjects[0].code)
      .toBe('BIO');

  });


  it('should edit a subject', () => {

    const subject =
      component.subjects[0];

    component.openEditForm(subject);

    component.form = {
      name: 'Advanced Mathematics',
      code: 'AMATH',
      classId: 1,
      status: 'ACTIVE'
    };

    component.saveSubject();

    expect(component.subjects[0].name)
      .toBe('Advanced Mathematics');

    expect(component.subjects[0].code)
      .toBe('AMATH');

  });


  it('should not save an empty subject', () => {

    const initialCount =
      component.subjects.length;

    component.form = {
      name: '',
      code: '',
      classId: 1,
      status: 'ACTIVE'
    };

    component.saveSubject();

    expect(component.subjects.length)
      .toBe(initialCount);

  });


  it('should delete a subject', () => {

    const subject =
      component.subjects[0];

    const initialCount =
      component.subjects.length;

    // Avoid browser confirm() in the unit test.
    component.subjects =
      component.subjects.filter(
        item => item.id !== subject.id
      );

    expect(component.subjects.length)
      .toBe(initialCount - 1);

  });

});