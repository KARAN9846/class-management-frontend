import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { TeacherService } from '../../teachers/services/teacher.service';
import { Teacher } from '../../teachers/models/teacher.model';

import { TeacherRoleService } from '../../teacher-roles/services/teacher-role.service';
import { TeacherRole } from '../../teacher-roles/models/teacher-role.model';

import { AcademicYearService } from '../../academic/academic-years/services/academic-year.service';
import { AcademicYear } from '../../academic/academic-years/academic-year.model';

import { ClassService } from '../../academic/classes/class.service';
import { AcademicClass } from '../../academic/classes/class.model';

import { SectionService } from '../../academic/classes/section.service';
import { Section } from '../../academic/classes/section.model';

import { TeacherRoleAssignmentService } from '../services/teacher-role-assignment.service';

import {
  TeacherRoleAssignment,
  TeacherRoleScope,
  CreateTeacherRoleAssignmentRequest
} from '../models/teacher-role-assignment.model';


@Component({
  selector: 'app-teacher-role-assignment-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './teacher-role-assignment-form.html',
  styleUrl: './teacher-role-assignment-form.scss'
})
export class TeacherRoleAssignmentForm implements OnInit {

  // =========================================================
  // SERVICES
  // =========================================================

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private readonly teacherService =
    inject(TeacherService);

  private readonly teacherRoleService =
    inject(TeacherRoleService);

  private readonly academicYearService =
    inject(AcademicYearService);

  private readonly classService =
    inject(ClassService);

  private readonly sectionService =
    inject(SectionService);

  private readonly assignmentService =
    inject(TeacherRoleAssignmentService);

  private readonly cdr =
    inject(ChangeDetectorRef);


  // =========================================================
  // EDIT MODE
  // =========================================================

  isEditMode = false;

  editingTeacherId: number | null = null;

  loadingAssignment = false;


  // =========================================================
  // DATA
  // =========================================================

  teachers: Teacher[] = [];

  roles: TeacherRole[] = [];

  academicYears: AcademicYear[] = [];

  classes: AcademicClass[] = [];

  sections: Section[] = [];


  // =========================================================
  // SELECTED VALUES
  // =========================================================

  selectedTeacherId: number | null = null;

  selectedRoleId: number | null = null;

  selectedAcademicYearId: number | null = null;

  selectedClassId: number | null = null;

  selectedSectionId: number | null = null;


  // =========================================================
  // SCOPES
  // =========================================================

  scopes: TeacherRoleScope[] = [];


  // =========================================================
  // STATE
  // =========================================================

  loading = false;

  loadingClasses = false;

  loadingSections = false;

  submitting = false;

  errorMessage = '';

  successMessage = '';


  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {

    const teacherIdParam =
      this.route.snapshot.paramMap.get('teacherId');


    // ---------------------------------------------------------
    // DETECT EDIT MODE
    // ---------------------------------------------------------

    if (teacherIdParam) {

      const teacherId =
        Number(teacherIdParam);

      if (!teacherId) {

        this.errorMessage =
          'Invalid teacher ID.';

        return;
      }

      this.isEditMode = true;

      this.editingTeacherId =
        teacherId;

      this.selectedTeacherId =
        teacherId;
    }


    // ---------------------------------------------------------
    // LOAD BASIC DATA
    // ---------------------------------------------------------

    this.loadTeachers();

    this.loadRoles();

    this.loadAcademicYears();


    // ---------------------------------------------------------
    // LOAD EXISTING ASSIGNMENT
    // ---------------------------------------------------------

    if (
      this.isEditMode &&
      this.editingTeacherId
    ) {

      this.loadAssignment(
        this.editingTeacherId
      );
    }
  }


  // =========================================================
  // LOAD TEACHERS
  // =========================================================

  loadTeachers(): void {

    this.teacherService
      .getTeachers(0, 1000, '')
      .subscribe({

        next: (response) => {

          this.teachers =
            response?.data?.content ?? [];
        },

        error: (error) => {

          console.error(
            'Failed to load teachers',
            error
          );

          this.errorMessage =
            error?.error?.message ??
            'Failed to load teachers.';
        }
      });
  }


  // =========================================================
  // LOAD ROLES
  // =========================================================

  loadRoles(): void {

    this.teacherRoleService
      .getRoles()
      .subscribe({

        next: (response) => {

          this.roles =
            response?.data ?? [];
        },

        error: (error) => {

          console.error(
            'Failed to load teacher roles',
            error
          );

          this.errorMessage =
            error?.error?.message ??
            'Failed to load teacher roles.';
        }
      });
  }


  // =========================================================
  // LOAD ACADEMIC YEARS
  // =========================================================

  loadAcademicYears(): void {

    this.academicYearService
      .getAll()
      .subscribe({

        next: (response) => {

          this.academicYears =
            response?.data?.content ?? [];
        },

        error: (error) => {

          console.error(
            'Failed to load academic years',
            error
          );

          this.errorMessage =
            error?.error?.message ??
            'Failed to load academic years.';
        }
      });
  }


  // =========================================================
  // LOAD EXISTING ASSIGNMENT
  // =========================================================

  loadAssignment(
    teacherId: number
  ): void {

    this.loadingAssignment = true;

    this.errorMessage = '';

    this.assignmentService
      .getAssignmentByTeacherId(teacherId)
      .subscribe({

        next: (response) => {

          const assignment:
            TeacherRoleAssignment | null =
              response?.data ?? null;


          if (!assignment) {

            this.errorMessage =
              'Teacher role assignment not found.';

            this.loadingAssignment =
              false;

            this.cdr.detectChanges();

            return;
          }


          // ---------------------------------------------------
          // TEACHER
          // ---------------------------------------------------

          this.selectedTeacherId =
            assignment.teacherId;


          // ---------------------------------------------------
          // ROLE
          // ---------------------------------------------------

          this.selectedRoleId =
            assignment.teacherRoleId;


          // ---------------------------------------------------
          // SCOPES
          // ---------------------------------------------------

          this.scopes =
            assignment.scopes?.map(
              scope => ({

                id: scope.id,

                academicYearId:
                  scope.academicYearId,

                academicYearName:
                  scope.academicYearName,

                classId:
                  scope.classId,

                className:
                  scope.className,

                sectionId:
                  scope.sectionId,

                sectionName:
                  scope.sectionName
              })
            ) ?? [];


          // ---------------------------------------------------
          // LOAD FIRST SCOPE INTO FORM
          // ---------------------------------------------------

          if (this.scopes.length > 0) {

            const firstScope =
              this.scopes[0];


            this.selectedAcademicYearId =
              firstScope.academicYearId;

            this.selectedClassId =
              firstScope.classId;

            this.selectedSectionId =
              firstScope.sectionId ?? null;


            // Load class + section dropdown data
            this.loadClassesForEdit(
              firstScope.academicYearId,
              firstScope.classId,
              firstScope.sectionId ?? null
            );
          }


          this.loadingAssignment =
            false;

          this.cdr.detectChanges();
        },

        error: (error) => {

          console.error(
            'Failed to load teacher role assignment',
            error
          );

          this.errorMessage =
            error?.error?.message ??
            'Failed to load teacher role assignment.';

          this.loadingAssignment =
            false;

          this.cdr.detectChanges();
        }
      });
  }


  // =========================================================
  // LOAD CLASSES FOR EDIT
  // =========================================================

  loadClassesForEdit(
    academicYearId: number,
    classId: number,
    sectionId: number | null
  ): void {

    this.loadingClasses = true;

    this.classService
      .getClasses()
      .subscribe({

        next: (response) => {

          const allClasses =
            response?.data ?? [];


          this.classes =
            allClasses.filter(
              item =>
                item.academicYearId ===
                academicYearId
            );


          this.loadingClasses =
            false;


          // ---------------------------------------------------
          // LOAD SECTIONS
          // ---------------------------------------------------

          if (classId) {

            this.loadingSections = true;

            this.sectionService
              .getSections(classId)
              .subscribe({

                next: (sectionResponse) => {

                  this.sections =
                    sectionResponse?.data ?? [];

                  this.selectedSectionId =
                    sectionId;

                  this.loadingSections =
                    false;
                },

                error: (error) => {

                  console.error(
                    'Failed to load sections',
                    error
                  );

                  this.errorMessage =
                    error?.error?.message ??
                    'Failed to load sections.';

                  this.loadingSections =
                    false;
                }
              });
          }
        },

        error: (error) => {

          console.error(
            'Failed to load classes',
            error
          );

          this.errorMessage =
            error?.error?.message ??
            'Failed to load classes.';

          this.loadingClasses =
            false;
        }
      });
  }


  // =========================================================
  // ACADEMIC YEAR CHANGE
  // =========================================================

  onAcademicYearChange(): void {

    this.selectedClassId = null;

    this.selectedSectionId = null;

    this.classes = [];

    this.sections = [];


    if (!this.selectedAcademicYearId) {
      return;
    }


    this.loadingClasses = true;

    this.classService
      .getClasses()
      .subscribe({

        next: (response) => {

          const allClasses =
            response?.data ?? [];


          this.classes =
            allClasses.filter(
              item =>
                item.academicYearId ===
                this.selectedAcademicYearId
            );


          this.loadingClasses =
            false;
        },

        error: (error) => {

          console.error(
            'Failed to load classes',
            error
          );

          this.errorMessage =
            error?.error?.message ??
            'Failed to load classes.';

          this.loadingClasses =
            false;
        }
      });
  }


  // =========================================================
  // CLASS CHANGE
  // =========================================================

  onClassChange(): void {

    this.selectedSectionId = null;

    this.sections = [];


    if (!this.selectedClassId) {
      return;
    }


    this.loadingSections = true;

    this.sectionService
      .getSections(this.selectedClassId)
      .subscribe({

        next: (response) => {

          this.sections =
            response?.data ?? [];

          this.loadingSections =
            false;
        },

        error: (error) => {

          console.error(
            'Failed to load sections',
            error
          );

          this.errorMessage =
            error?.error?.message ??
            'Failed to load sections.';

          this.loadingSections =
            false;
        }
      });
  }


  // =========================================================
  // ADD SCOPE
  // =========================================================

  addScope(): void {

    this.errorMessage = '';


    if (!this.selectedAcademicYearId) {

      this.errorMessage =
        'Please select an academic year.';

      return;
    }


    if (!this.selectedClassId) {

      this.errorMessage =
        'Please select a class.';

      return;
    }


    const duplicate =
      this.scopes.some(scope =>

        scope.academicYearId ===
          this.selectedAcademicYearId &&

        scope.classId ===
          this.selectedClassId &&

        scope.sectionId ===
          this.selectedSectionId
      );


    if (duplicate) {

      this.errorMessage =
        'This scope has already been added.';

      return;
    }


    const scope: TeacherRoleScope = {

      academicYearId:
        this.selectedAcademicYearId,

      academicYearName:
        this.getAcademicYearName(
          this.selectedAcademicYearId
        ),

      classId:
        this.selectedClassId,

      className:
        this.getClassName(
          this.selectedClassId
        ),

      sectionId:
        this.selectedSectionId ??
        undefined,

      sectionName:
        this.getSectionName(
          this.selectedSectionId
        )
    };


    this.scopes = [
      ...this.scopes,
      scope
    ];


    this.selectedClassId = null;

    this.selectedSectionId = null;

    this.sections = [];
  }


  // =========================================================
  // REMOVE SCOPE
  // =========================================================

  removeScope(index: number): void {

    this.scopes =
      this.scopes.filter(
        (_, i) => i !== index
      );
  }


  // =========================================================
  // GET ACADEMIC YEAR NAME
  // =========================================================

  getAcademicYearName(
    id: number
  ): string {

    const year =
      this.academicYears.find(
        item => item.id === id
      );

    return year?.name ??
      'Unknown Year';
  }


  // =========================================================
  // GET CLASS NAME
  // =========================================================

  getClassName(
    id: number
  ): string {

    const academicClass =
      this.classes.find(
        item => item.id === id
      );


    if (academicClass) {

      return academicClass.name;
    }


    return `Class #${id}`;
  }


  // =========================================================
  // GET SECTION NAME
  // =========================================================

  getSectionName(
    id: number | null | undefined
  ): string {

    if (!id) {

      return 'All Sections';
    }


    const section =
      this.sections.find(
        item => item.id === id
      );


    return section?.name ??
      `Section #${id}`;
  }


  // =========================================================
  // SUBMIT
  // =========================================================

  submit(): void {

    this.errorMessage = '';

    this.successMessage = '';


    // -------------------------------------------------------
    // VALIDATION
    // -------------------------------------------------------

    if (!this.selectedTeacherId) {

      this.errorMessage =
        'Please select a teacher.';

      return;
    }


    if (!this.selectedRoleId) {

      this.errorMessage =
        'Please select a teacher role.';

      return;
    }


    if (this.scopes.length === 0) {

      this.errorMessage =
        'Please add at least one assignment scope.';

      return;
    }


    if (this.submitting) {
      return;
    }


    // -------------------------------------------------------
    // REQUEST
    // -------------------------------------------------------

    const request:
      CreateTeacherRoleAssignmentRequest = {

        teacherId:
          this.selectedTeacherId,

        teacherRoleId:
          this.selectedRoleId,

        scopes:
          this.scopes.map(scope => {

            const result: {
              academicYearId: number;
              classId: number;
              sectionId?: number;
            } = {

              academicYearId:
                scope.academicYearId,

              classId:
                scope.classId
            };


            if (scope.sectionId) {

              result.sectionId =
                scope.sectionId;
            }


            return result;
          })
      };


    // -------------------------------------------------------
    // SUBMIT
    // -------------------------------------------------------

    this.submitting = true;


    if (this.isEditMode && this.editingTeacherId) {

      this.assignmentService
        .updateAssignment(this.editingTeacherId, request)
        .subscribe({

          next: (response) => {

            this.submitting = false;

            this.successMessage =
              response?.message ??
              'Teacher role assignment updated successfully.';


            setTimeout(() => {

              this.router.navigate([
                '/admin/teacher-role-assignments'
              ]);

            }, 800);
          },

          error: (error) => {

            console.error(
              'Failed to update teacher role assignment',
              error
            );

            this.errorMessage =
              error?.error?.message ??
              'Failed to update teacher role assignment.';

            this.submitting = false;
          }
        });

    } else {

      this.assignmentService
        .assignRole(request)
        .subscribe({

          next: (response) => {

            this.submitting = false;

            this.successMessage =
              response?.message ??
              'Teacher role assigned successfully.';


            setTimeout(() => {

              this.router.navigate([
                '/admin/teacher-role-assignments'
              ]);

            }, 800);
          },

          error: (error) => {

            console.error(
              'Failed to save teacher role assignment',
              error
            );

            this.errorMessage =
              error?.error?.message ??
              'Failed to assign teacher role.';

            this.submitting = false;
          }
        });
    }
  }


  // =========================================================
  // CANCEL
  // =========================================================

  cancel(): void {

    if (this.submitting) {
      return;
    }


    this.router.navigate([
      '/admin/teacher-role-assignments'
    ]);
  }
}