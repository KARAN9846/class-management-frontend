import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { ClassService } from '../../academic/classes/class.service';
import { AcademicClass } from '../../academic/classes/class.model';

import { SectionService } from '../../academic/classes/section.service';
import { Section } from '../../academic/classes/section.model';

import { SubjectService } from '../../academic/subjects/subject.service';
import { Subject } from '../../academic/subjects/subject.model';

import { TeacherAssignmentService } from '../services/teacher-assignment.service';
import {
  TeacherAssignment,
  TeacherAssignmentRequest
} from '../models/teacher-assignment.model';

interface ManagerSubject {
  subject: Subject;
  selected: boolean;
  existingAssignment: TeacherAssignment | null;
}

interface ManagerSection {
  section: Section;
  subjects: ManagerSubject[];
}

interface ManagerClass {
  classroom: AcademicClass;
  sections: ManagerSection[];
}

@Component({
  selector: 'app-teacher-assignment-manager',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './teacher-assignment-manager.html',
  styleUrl: './teacher-assignment-manager.scss'
})
export class TeacherAssignmentManager implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly classService = inject(ClassService);
  private readonly sectionService = inject(SectionService);
  private readonly subjectService = inject(SubjectService);
  private readonly assignmentService = inject(TeacherAssignmentService);
  private readonly cdr = inject(ChangeDetectorRef);

  teacherId: number | null = null;
  academicYearId: number | null = null;

  teacherName = '';
  academicYearName = '';

  classes: ManagerClass[] = [];

  loading = false;
  saving = false;

  errorMessage = '';
  successMessage = '';

  ngOnInit(): void {
    this.teacherId = Number(
      this.route.snapshot.paramMap.get('teacherId')
    );

    this.academicYearId = Number(
      this.route.snapshot.paramMap.get('academicYearId')
    );

    if (!this.teacherId || !this.academicYearId) {
      this.errorMessage = 'Invalid teacher assignment details.';
      return;
    }

    this.loadManagerData();
  }

  loadManagerData(): void {
    this.loading = true;
    this.errorMessage = '';

    this.assignmentService.getAll().subscribe({
      next: assignmentResponse => {
        const assignments = assignmentResponse.data ?? [];

        const teacherAssignments = assignments.filter(
          assignment =>
            assignment.teacherId === this.teacherId &&
            assignment.academicYearId === this.academicYearId
        );

        if (teacherAssignments.length > 0) {
          this.teacherName = teacherAssignments[0].teacherName;
          this.academicYearName =
            teacherAssignments[0].academicYearName;
        }

        this.loadClasses(teacherAssignments);
      },

      error: error => {
        console.error('Failed to load teacher assignments:');

        this.loading = false;
        this.errorMessage =
          error?.error?.message ||
          'Failed to load teacher assignments. Please try again.';

        this.cdr.detectChanges();
      }
    });
  }

  private loadClasses(
    existingAssignments: TeacherAssignment[]
  ): void {

    this.classService.getClasses().subscribe({
      next: response => {
        const classes = (response.data ?? []).filter(
          classroom =>
            classroom.academicYearId === this.academicYearId
        );

        this.loadClassDetails(classes, existingAssignments);
      },

      error: error => {
        console.error('Failed to load classes:');

        this.loading = false;
        this.errorMessage =
          error?.error?.message ||
          'Failed to load classes. Please try again.';

        this.cdr.detectChanges();
      }
    });
  }

  private loadClassDetails(
    classes: AcademicClass[],
    existingAssignments: TeacherAssignment[]
  ): void {

    if (classes.length === 0) {
      this.classes = [];
      this.loading = false;
      this.cdr.detectChanges();
      return;
    }

    let completed = 0;
    const managerClasses: ManagerClass[] = [];

    for (const classroom of classes) {

      this.sectionService.getSections(classroom.id).subscribe({
        next: sectionResponse => {

          const sections = sectionResponse.data ?? [];

          this.subjectService.getSubjects().subscribe({
            next: subjectResponse => {

              const subjects = (subjectResponse.data ?? []).filter(
                subject =>
                  subject.classId === classroom.id
              );

              const managerSections: ManagerSection[] =
                sections.map(section => {

                  const sectionSubjects: ManagerSubject[] =
                    subjects.map(subject => {

                      const existingAssignment =
                        existingAssignments.find(
                          assignment =>
                            assignment.classId === classroom.id &&
                            assignment.sectionId === section.id &&
                            assignment.subjectId === subject.id
                        ) ?? null;

                      return {
                        subject,
                        selected: existingAssignment !== null,
                        existingAssignment
                      };
                    });

                  return {
                    section,
                    subjects: sectionSubjects
                  };
                });

              managerClasses.push({
                classroom,
                sections: managerSections
              });

              completed++;

              if (completed === classes.length) {
                managerClasses.sort(
                  (a, b) =>
                    a.classroom.name.localeCompare(
                      b.classroom.name
                    )
                );

                this.classes = managerClasses;
                this.loading = false;
                this.cdr.detectChanges();
              }
            },

            error: error => {
              console.error('Failed to load subjects:');

              completed++;

              if (completed === classes.length) {
                this.classes = managerClasses;
                this.loading = false;
              }

              this.errorMessage =
                error?.error?.message ||
                'Failed to load subjects. Please try again.';

              this.cdr.detectChanges();
            }
          });
        },

        error: error => {
          console.error('Failed to load sections:');

          completed++;

          if (completed === classes.length) {
            this.classes = managerClasses;
            this.loading = false;
          }

          this.errorMessage =
            error?.error?.message ||
            'Failed to load sections. Please try again.';

          this.cdr.detectChanges();
        }
      });
    }
  }

  toggleSubject(
    managerSubject: ManagerSubject
  ): void {
    managerSubject.selected =
      !managerSubject.selected;
  }

  get selectedCount(): number {
    return this.classes.reduce(
      (total, managerClass) =>
        total +
        managerClass.sections.reduce(
          (sectionTotal, section) =>
            sectionTotal +
            section.subjects.filter(
              subject => subject.selected
            ).length,
          0
        ),
      0
    );
  }

  save(): void {
    if (
      this.teacherId === null ||
      this.academicYearId === null
    ) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    const selectedAssignments =
      this.getSelectedAssignments();

    const existingAssignments =
      this.getExistingAssignments();

    const assignmentsToCreate =
      selectedAssignments.filter(
        selected =>
          !existingAssignments.some(
            existing =>
              existing.classId === selected.classId &&
              existing.sectionId === selected.sectionId &&
              existing.subjectId === selected.subjectId
          )
      );

    const assignmentsToDelete =
      existingAssignments.filter(
        existing =>
          !selectedAssignments.some(
            selected =>
              selected.classId === existing.classId &&
              selected.sectionId === existing.sectionId &&
              selected.subjectId === existing.subjectId
          )
      );

    if (
      assignmentsToCreate.length === 0 &&
      assignmentsToDelete.length === 0
    ) {
      this.successMessage = 'No assignment changes to save.';
      this.cdr.detectChanges();
      return;
    }

    this.saving = true;

    this.processCreatesAndDeletes(
      assignmentsToCreate,
      assignmentsToDelete
    );
  }

  private getSelectedAssignments(): TeacherAssignmentRequest[] {
    const requests: TeacherAssignmentRequest[] = [];

    for (const managerClass of this.classes) {
      for (const section of managerClass.sections) {
        for (const subject of section.subjects) {

          if (!subject.selected) {
            continue;
          }

          requests.push({
            teacherId: this.teacherId!,
            academicYearId: this.academicYearId!,
            classId: managerClass.classroom.id,
            sectionId: section.section.id,
            subjectId: subject.subject.id
          });
        }
      }
    }

    return requests;
  }

  private getExistingAssignments(): TeacherAssignment[] {
    const existing: TeacherAssignment[] = [];

    for (const managerClass of this.classes) {
      for (const section of managerClass.sections) {
        for (const subject of section.subjects) {

          if (subject.existingAssignment) {
            existing.push(
              subject.existingAssignment
            );
          }
        }
      }
    }

    return existing;
  }

  private processCreatesAndDeletes(
    assignmentsToCreate: TeacherAssignmentRequest[],
    assignmentsToDelete: TeacherAssignment[]
  ): void {

    let remainingCreates =
      assignmentsToCreate.length;

    let remainingDeletes =
      assignmentsToDelete.length;

    let hasError = false;

    const finish = (): void => {

      if (
        remainingCreates === 0 &&
        remainingDeletes === 0
      ) {
        this.saving = false;

        if (!hasError) {
          this.successMessage =
            'Teacher assignments updated successfully.';

          this.cdr.detectChanges();

          setTimeout(() => {
            this.router.navigate([
              '/admin/teacher-assignments'
            ]);
          }, 700);
        } else {
          this.cdr.detectChanges();
        }
      }
    };

    if (remainingCreates === 0) {
      remainingCreates = 0;
    }

    for (const request of assignmentsToCreate) {
      this.assignmentService.create(request).subscribe({
        next: () => {
          remainingCreates--;
          finish();
        },

        error: error => {
          hasError = true;
          remainingCreates--;

          console.error(
            'Failed to create teacher assignment:'
          );

          this.errorMessage =
            error?.error?.message ||
            'Failed to save one or more assignments.';

          finish();
        }
      });
    }

    for (const assignment of assignmentsToDelete) {
      this.assignmentService.delete(assignment.id).subscribe({
        next: () => {
          remainingDeletes--;
          finish();
        },

        error: error => {
          hasError = true;
          remainingDeletes--;

          console.error(
            'Failed to delete teacher assignment:'
          );

          this.errorMessage =
            error?.error?.message ||
            'Failed to delete one or more assignments.';

          finish();
        }
      });
    }

    finish();
  }

  cancel(): void {
    this.router.navigate([
      '/admin/teacher-assignments'
    ]);
  }

  goBack(): void {
    this.cancel();
  }
}