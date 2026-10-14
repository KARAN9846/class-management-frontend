import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClassesComponent } from './classes';

describe('ClassesComponent', () => {

  let component: ClassesComponent;
  let fixture: ComponentFixture<ClassesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClassesComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ClassesComponent);
    component = fixture.componentInstance;
  });


  it('should create', () => {
    expect(component).toBeTruthy();
  });


  it('should initialize empty classes', () => {
    expect(component.classes).toEqual([]);
  });


  it('should open add class form', () => {

    component.openAddForm();

    expect(component.showForm).toBe(true);
    expect(component.editingClass).toBeNull();

  });


  it('should open the add form with empty sections', () => {
    component.openAddForm();

    expect(component.showForm).toBe(true);
    expect(component.editingClass).toBeNull();
    expect(component.formSections).toEqual([]);
  });

});