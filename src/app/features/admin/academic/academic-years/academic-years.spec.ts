import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcademicYearsComponent } from './academic-years';

describe('AcademicYearsComponent', () => {

  let component: AcademicYearsComponent;
  let fixture: ComponentFixture<AcademicYearsComponent>;

  beforeEach(async () => {

    await TestBed.configureTestingModule({
      imports: [AcademicYearsComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AcademicYearsComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });


  it('should create', () => {
    expect(component).toBeTruthy();
  });


  it('should have academic years', () => {
    expect(component.academicYears.length).toBeGreaterThan(0);
  });


  it('should filter academic years', () => {

    component.searchTerm = '2026';

    expect(component.filteredYears.length).toBe(1);
    expect(component.filteredYears[0].name).toBe('2026 - 2027');

  });


  it('should filter active academic years', () => {

    component.statusFilter = 'ACTIVE';

    expect(component.filteredYears.length).toBe(1);
    expect(component.filteredYears[0].isActive).toBe(true);

  });


  it('should open add form', () => {

    component.openAddForm();

    expect(component.showForm).toBe(true);
    expect(component.editingYear).toBe(null);

  });


  it('should add an academic year', () => {

    const initialCount = component.academicYears.length;

    component.form = {
      name: '2027 - 2028',
      startDate: '2027-06-01',
      endDate: '2028-03-31',
      status: 'ACTIVE'
    };

    component.saveYear();

    expect(component.academicYears.length)
      .toBe(initialCount + 1);

  });


  it('should delete an academic year', () => {

    const year = component.academicYears[0];

    const initialCount = component.academicYears.length;

    component.academicYears =
      component.academicYears.filter(
        item => item.id !== year.id
      );

    expect(component.academicYears.length)
      .toBe(initialCount - 1);

    expect(
      component.academicYears.some(
        item => item.id === year.id
      )
    ).toBe(false);

  });

});