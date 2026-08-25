import {
  Component,
  ChangeDetectorRef,
  OnInit,
  inject
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  StudentService
} from '../services/student.service';

import {
  AcademicYearService
} from '../../academic/academic-years/services/academic-year.service';

import {
  ClassService
} from '../../academic/classes/class.service';

import {
  SectionService
} from '../../academic/classes/section.service';

import {
  AcademicYear
} from '../../academic/academic-years/academic-year.model';

import {
  AcademicClass
} from '../../academic/classes/class.model';

import {
  Section
} from '../../academic/classes/section.model';

import {
  CreateStudentRequest,
  UpdateStudentRequest
} from '../models/student.model';


@Component({
  selector: 'app-student-form',
  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule
  ],

  templateUrl: './student-form.html',
  styleUrl: './student-form.scss'
})
export class StudentForm implements OnInit {

  private readonly fb = inject(FormBuilder);

  private readonly router = inject(Router);

  private readonly route =
    inject(ActivatedRoute);

  private readonly cdr =
    inject(ChangeDetectorRef);

  private readonly studentService =
    inject(StudentService);

  private readonly academicYearService =
    inject(AcademicYearService);

  private readonly classService =
    inject(ClassService);

  private readonly sectionService =
    inject(SectionService);


  // =========================================================
  // STATE
  // =========================================================

  isEditMode = false;

  studentId: number | null = null;

  loading = false;

  saving = false;

  errorMessages: string[] = [];

  errorMessage = '';

  successMessage = '';


  // =========================================================
  // DROPDOWN DATA
  // =========================================================

  academicYears: AcademicYear[] = [];

  classes: AcademicClass[] = [];

  sections: Section[] = [];

  filteredClasses: AcademicClass[] = [];


  // =========================================================
  // FORM
  // =========================================================

  studentForm = this.fb.group({

    // Backend generates roll number during CREATE.
    // Roll number is required during EDIT.
    rollNumber: [
      '',
      []
    ],

    firstName: [
      '',
      [
        Validators.required
      ]
    ],

    lastName: [
      '',
      [
        Validators.required
      ]
    ],

    email: [
      '',
      [
        Validators.required,
        Validators.email
      ]
    ],

    phone: [
      '',
      [
        Validators.required
      ]
    ],

    password: [
      '',
      [
        Validators.required
      ]
    ],

    academicYearId: [
      null as number | null,
      [
        Validators.required
      ]
    ],

    classId: [
      null as number | null,
      [
        Validators.required
      ]
    ],

    sectionId: [
      null as number | null,
      [
        Validators.required
      ]
    ]

  });


  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {

    this.checkEditMode();

    this.loadAcademicYears();

  }


  // =========================================================
  // CHECK CREATE / EDIT MODE
  // =========================================================

  private checkEditMode(): void {

    const id =
      this.route.snapshot.paramMap.get('id');


    // =======================================================
    // CREATE MODE
    // =======================================================

    if (!id) {

      this.isEditMode = false;

      this.studentId = null;


      // Password required during CREATE
      this.studentForm
        .get('password')
        ?.setValidators([
          Validators.required
        ]);

      this.studentForm
        .get('password')
        ?.updateValueAndValidity();


      // Roll number NOT required during CREATE
      this.studentForm
        .get('rollNumber')
        ?.clearValidators();

      this.studentForm
        .get('rollNumber')
        ?.updateValueAndValidity();

      return;
    }


    // =======================================================
    // EDIT MODE
    // =======================================================

    this.isEditMode = true;

    this.studentId = Number(id);


    // Password NOT required during EDIT
    this.studentForm
      .get('password')
      ?.clearValidators();

    this.studentForm
      .get('password')
      ?.updateValueAndValidity();


    // Roll number REQUIRED during EDIT
    this.studentForm
      .get('rollNumber')
      ?.setValidators([
        Validators.required
      ]);

    this.studentForm
      .get('rollNumber')
      ?.updateValueAndValidity();


    this.loadStudent();

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
            response.data.content;

          this.cdr.detectChanges();

        },

        error: (error) => {

          console.error(
            'Failed to load academic years:',
            error
          );

          this.handleError(
            error,
            'Failed to load academic years.'
          );

        }

      });

  }


  // =========================================================
  // ACADEMIC YEAR CHANGE
  // =========================================================

  onAcademicYearChange(): void {

    const academicYearId =
      this.studentForm
        .get('academicYearId')
        ?.value;


    // Clear previous errors
    this.clearMessages();


    // Reset dependent fields
    this.studentForm.patchValue({
      classId: null,
      sectionId: null
    });


    this.sections = [];

    this.filteredClasses = [];


    if (!academicYearId) {
      return;
    }


    this.classService
      .getClasses()
      .subscribe({

        next: (response) => {

          this.classes =
            response.data;


          this.filteredClasses =
            this.classes.filter(
              classroom =>
                Number(
                  classroom.academicYearId
                ) ===
                Number(
                  academicYearId
                )
            );


          this.cdr.detectChanges();

        },

        error: (error) => {

          console.error(
            'Failed to load classes:',
            error
          );

          this.handleError(
            error,
            'Failed to load classes.'
          );

        }

      });

  }


  // =========================================================
  // CLASS CHANGE
  // =========================================================

  onClassChange(): void {

    const classId =
      this.studentForm
        .get('classId')
        ?.value;


    // Clear previous errors
    this.clearMessages();


    // Reset section
    this.studentForm.patchValue({
      sectionId: null
    });


    this.sections = [];


    if (!classId) {
      return;
    }


    this.sectionService
      .getSections(
        Number(classId)
      )
      .subscribe({

        next: (response) => {

          this.sections =
            response.data;

          this.cdr.detectChanges();

        },

        error: (error) => {

          console.error(
            'Failed to load sections:',
            error
          );

          this.handleError(
            error,
            'Failed to load sections.'
          );

        }

      });

  }


  // =========================================================
  // LOAD STUDENT
  // =========================================================

  private loadStudent(): void {

    if (!this.studentId) {
      return;
    }


    this.loading = true;

    this.clearMessages();


    this.studentService
      .getStudentById(this.studentId)
      .subscribe({

        next: (response) => {

          const student =
            response.data;


          if (!student) {

            this.loading = false;

            this.errorMessages = [
              'Student data was not returned by the server.'
            ];

            this.errorMessage =
              this.errorMessages.join(' | ');

            this.cdr.detectChanges();

            return;
          }


          // =================================================
          // FILL STUDENT INFORMATION
          // =================================================

          this.studentForm.patchValue({

            rollNumber:
              student.rollNumber,

            firstName:
              student.firstName,

            lastName:
              student.lastName,

            email:
              student.email,

            phone:
              student.phone,

            academicYearId:
              Number(
                student.academicYearId
              ),

            classId:
              Number(
                student.classId
              ),

            sectionId:
              Number(
                student.sectionId
              )

          });


          // =================================================
          // LOAD CLASSES
          // =================================================

          this.classService
            .getClasses()
            .subscribe({

              next: (classResponse) => {

                this.classes =
                  classResponse.data;


                this.filteredClasses =
                  this.classes.filter(
                    classroom =>
                      Number(
                        classroom.academicYearId
                      ) ===
                      Number(
                        student.academicYearId
                      )
                  );


                // ===========================================
                // LOAD SECTIONS
                // ===========================================

                this.sectionService
                  .getSections(
                    Number(
                      student.classId
                    )
                  )
                  .subscribe({

                    next: (sectionResponse) => {

                      this.sections =
                        sectionResponse.data;

                      this.loading = false;

                      this.cdr.detectChanges();

                    },

                    error: (error) => {

                      console.error(
                        'Failed to load sections:',
                        error
                      );

                      this.handleError(
                        error,
                        'Failed to load sections.'
                      );

                    }

                  });

              },

              error: (error) => {

                console.error(
                  'Failed to load classes:',
                  error
                );

                this.handleError(
                  error,
                  'Failed to load classes.'
                );

              }

            });

        },

        error: (error) => {

          console.error(
            'Failed to load student:',
            error
          );

          console.error(
            'Status:',
            error?.status
          );

          console.error(
            'Backend response:',
            error?.error
          );


          this.handleError(
            error,
            `Failed to load student. HTTP ${
              error?.status || 'Unknown'
            }`
          );

        }

      });

  }


  // =========================================================
  // SUBMIT
  // =========================================================

  onSubmit(): void {

    this.clearMessages();


    // Validate form
    if (this.studentForm.invalid) {

      this.studentForm.markAllAsTouched();

      return;
    }


    this.saving = true;


    if (this.isEditMode) {

      this.updateStudent();

    } else {

      this.createStudent();

    }

  }


  // =========================================================
  // CREATE STUDENT
  // =========================================================

  private createStudent(): void {

    const formValue =
      this.studentForm.getRawValue();


    /*
     * IMPORTANT:
     *
     * rollNumber is NOT sent here.
     *
     * Backend generates the roll number
     * automatically during CREATE.
     */

    const request: CreateStudentRequest = {

      firstName:
        formValue.firstName!.trim(),

      lastName:
        formValue.lastName!.trim(),

      email:
        formValue.email!.trim(),

      password:
        formValue.password!,

      phone:
        formValue.phone?.trim() || '',

      academicYearId:
        Number(
          formValue.academicYearId
        ),

      classId:
        Number(
          formValue.classId
        ),

      sectionId:
        Number(
          formValue.sectionId
        )

    };


    this.studentService
      .createStudent(request)
      .subscribe({

        next: () => {

          this.saving = false;

          this.successMessage =
            'Student created successfully.';

          this.cdr.detectChanges();


          setTimeout(() => {

            this.router.navigate([
              '/admin/students'
            ]);

          }, 800);

        },

        error: (error) => {

          console.error(
            'Failed to create student:',
            error
          );


          this.handleError(
            error,
            'Failed to create student.'
          );

        }

      });

  }


  // =========================================================
  // UPDATE STUDENT
  // =========================================================

  private updateStudent(): void {

    if (!this.studentId) {

      this.saving = false;

      this.errorMessages = [
        'Invalid student ID.'
      ];

      this.errorMessage =
        'Invalid student ID.';

      this.cdr.detectChanges();

      return;
    }


    const formValue =
      this.studentForm.getRawValue();


    // =======================================================
    // ROLL NUMBER
    // =======================================================

    const requestedRollNumber =
      formValue.rollNumber!
        .trim()
        .toUpperCase();


    // =======================================================
    // UPDATE REQUEST
    // =======================================================

    const request: UpdateStudentRequest = {

      rollNumber:
        requestedRollNumber,

      firstName:
        formValue.firstName!.trim(),

      lastName:
        formValue.lastName!.trim(),

      email:
        formValue.email!.trim(),

      phone:
        formValue.phone?.trim() || '',

      academicYearId:
        Number(
          formValue.academicYearId
        ),

      classId:
        Number(
          formValue.classId
        ),

      sectionId:
        Number(
          formValue.sectionId
        )

    };


    this.studentService
      .updateStudent(
        this.studentId,
        request
      )
      .subscribe({

        next: () => {

          this.saving = false;

          this.successMessage =
            'Student updated successfully.';

          this.cdr.detectChanges();


          setTimeout(() => {

            this.router.navigate([
              '/admin/students'
            ]);

          }, 800);

        },

        error: (error) => {

          console.error(
            'Failed to update student:',
            error
          );


          this.handleError(
            error,
            'Failed to update student.'
          );

        }

      });

  }


  // =========================================================
  // ERROR HANDLING
  // =========================================================

  private handleError(
    error: any,
    defaultMessage: string
  ): void {

    console.error(
      'Backend error:',
      error
    );


    this.errorMessages = [];


    const backendError =
      error?.error;


    // =======================================================
    // BACKEND ERRORS ARRAY
    // =======================================================

    if (
      Array.isArray(
        backendError?.errors
      )
    ) {

      backendError.errors.forEach(
        (item: any) => {


          // -----------------------------------------------
          // errors: ["Email already exists"]
          // -----------------------------------------------

          if (
            typeof item === 'string'
          ) {

            this.errorMessages.push(
              item
            );

            return;
          }


          // -----------------------------------------------
          // errors: [{ message: "Email already exists" }]
          // -----------------------------------------------

          if (
            item?.message
          ) {

            this.errorMessages.push(
              item.message
            );

            return;
          }


          // -----------------------------------------------
          // errors:
          // [
          //   {
          //     field: "email",
          //     defaultMessage: "must be valid"
          //   }
          // ]
          // -----------------------------------------------

          if (
            item?.field &&
            item?.defaultMessage
          ) {

            this.errorMessages.push(
              `${item.field}: ${item.defaultMessage}`
            );

            return;
          }


          // -----------------------------------------------
          // errors:
          // [
          //   {
          //     field: "email",
          //     message: "Email already exists"
          //   }
          // ]
          // -----------------------------------------------

          if (
            item?.field &&
            item?.message
          ) {

            this.errorMessages.push(
              `${item.field}: ${item.message}`
            );

            return;
          }


          // -----------------------------------------------
          // Fallback
          // -----------------------------------------------

          if (item != null) {

            this.errorMessages.push(
              JSON.stringify(item)
            );

          }

        }
      );

    }


    // =======================================================
    // IF NO ERRORS ARRAY
    // USE MAIN BACKEND MESSAGE
    // =======================================================

    if (
      this.errorMessages.length === 0
    ) {

      const message =
        backendError?.message ||
        error?.message ||
        defaultMessage;


      this.errorMessages.push(
        message
      );

    }


    // =======================================================
    // KEEP SINGLE ERROR STRING TOO
    // =======================================================

    this.errorMessage =
      this.errorMessages.join(' | ');


    this.saving = false;

    this.loading = false;


    this.cdr.detectChanges();

  }


  // =========================================================
  // CLEAR MESSAGES
  // =========================================================

  private clearMessages(): void {

    this.errorMessages = [];

    this.errorMessage = '';

    this.successMessage = '';

  }


  // =========================================================
  // CANCEL
  // =========================================================

  cancel(): void {

    this.router.navigate([
      '/admin/students'
    ]);

  }


  // =========================================================
  // FORM HELPER
  // =========================================================

  isInvalid(
    fieldName: string
  ): boolean {

    const field =
      this.studentForm.get(
        fieldName
      );


    return !!(
      field &&
      field.invalid &&
      field.touched
    );

  }

}