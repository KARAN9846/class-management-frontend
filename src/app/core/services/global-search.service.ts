import { Injectable, inject } from '@angular/core';

import {
  forkJoin,
  Observable,
  of
} from 'rxjs';

import {
  catchError,
  map,
  switchMap
} from 'rxjs/operators';

import { AttendanceService } from '../../features/admin/attendance/services/attendance.service';
import { StudentFeeService } from '../../features/admin/fees/services/student-fee.service';

import {
  Attendance
} from '../../features/admin/attendance/models/attendance.model';

import {
  NAVIGATION_CONFIG,
  NavigationItem
} from '../navigation/navigation.config';

import { TokenService } from '../auth/token.service';
import { PermissionService } from '../auth/permission.service';

import { StudentService } from '../../features/admin/students/services/student.service';
import { TeacherService } from '../../features/admin/teachers/services/teacher.service';
import { TeacherStudentService } from '../../features/teacher/students/services/teacher-student.service';

import {
  GlobalSearchAction,
  GlobalSearchResult,
  GlobalSearchStudentQuickView,
  GlobalSearchTeacherQuickView
} from '../../shared/components/global-search/global-search.models';

import { TeacherRoleAssignmentService } from '../../features/admin/teacher-role-assignments/services/teacher-role-assignment.service';
import { TeacherRoleService } from '../../features/admin/teacher-roles/services/teacher-role.service';

import { ClassService } from '../../features/admin/academic/classes/class.service';
import { SubjectService } from '../../features/admin/academic/subjects/subject.service';


@Injectable({
  providedIn: 'root'
})
export class GlobalSearchService {

  private readonly tokenService =
    inject(TokenService);

  private readonly permissionService =
    inject(PermissionService);

  private readonly studentService =
    inject(StudentService);

  private readonly teacherService =
    inject(TeacherService);

  private readonly teacherRoleAssignmentService =
    inject(TeacherRoleAssignmentService);

  private readonly teacherRoleService =
    inject(TeacherRoleService);
  private readonly teacherStudentService =
    inject(TeacherStudentService);

  private readonly attendanceService =
    inject(AttendanceService);

  private readonly studentFeeService =
    inject(StudentFeeService);

  private readonly classService =
    inject(ClassService);

  private readonly subjectService =
    inject(SubjectService);


  // =========================================================
  // ROLE
  // =========================================================

  private getRole(): string | null {
    return this.tokenService.getRole();
  }


  // =========================================================
  // NAVIGATION
  // =========================================================

  getNavigationItems(): NavigationItem[] {

    const role = this.getRole();

    if (!role) {
      return [];
    }

    const sections =
      NAVIGATION_CONFIG[role] ?? [];

    return sections.flatMap(
      section => section.items
    );
  }

  // =========================================================
  // QUICK ACTIONS
  // =========================================================

  private readonly quickActions: GlobalSearchAction[] = [

    // -------------------------------------------------------
    // ADMIN
    // -------------------------------------------------------

    {
      id: 'ADD_STUDENT',
      title: 'Add Student',
      description: 'Create a new student',
      icon: '+',
      route: '/admin/students/create',
      roles: ['ADMIN'],
      aliases: [
        'new student',
        'create student',
        'add student'
      ]
    },

    {
      id: 'ADD_TEACHER',
      title: 'Add Teacher',
      description: 'Create a new teacher',
      icon: '+',
      route: '/admin/teachers/create',
      roles: ['ADMIN'],
      aliases: [
        'new teacher',
        'create teacher',
        'add teacher'
      ]
    },

    {
      id: 'ADD_TEACHER_ROLE',
      title: 'Add Teacher Role',
      description: 'Create a new teacher role',
      icon: '+',
      route: '/admin/teacher-roles/create',
      roles: ['ADMIN'],
      aliases: [
        'new teacher role',
        'create teacher role',
        'add teacher role'
      ]
    },

    {
      id: 'ASSIGN_TEACHER_ROLE',
      title: 'Assign Teacher Role',
      description: 'Assign a role to a teacher',
      icon: '↗',
      route: '/admin/teacher-role-assignments/create',
      roles: ['ADMIN'],
      aliases: [
        'assign role',
        'assign teacher role',
        'teacher role assignment'
      ]
    },

    {
      id: 'ADD_TEACHER_ASSIGNMENT',
      title: 'Add Teacher Assignment',
      description: 'Assign academic scope to a teacher',
      icon: '+',
      route: '/admin/teacher-assignments/create',
      roles: ['ADMIN'],
      aliases: [
        'new teacher assignment',
        'create teacher assignment',
        'add teacher assignment'
      ]
    },

    {
      id: 'ADD_ASSIGNMENT',
      title: 'Add Assignment',
      description: 'Create a new assignment',
      icon: '+',
      route: '/admin/assignments/create',
      roles: ['ADMIN'],
      aliases: [
        'new assignment',
        'create assignment',
        'add assignment'
      ]
    },

    {
      id: 'ADD_FEE_STRUCTURE',
      title: 'Add Fee Structure',
      description: 'Create a new fee structure',
      icon: '+',
      route: '/admin/fees/fee-structures/create',
      roles: ['ADMIN'],
      aliases: [
        'new fee structure',
        'create fee structure',
        'add fee structure',
        'fees'
      ]
    },

    // -------------------------------------------------------
    // TEACHER
    // -------------------------------------------------------

    {
      id: 'ADD_STUDENT',
      title: 'Add Student',
      description: 'Create a new student',
      icon: '+',
      route: '/teacher/students/create',
      roles: ['TEACHER'],
      aliases: [
        'new student',
        'create student',
        'add student'
      ]
    },

    {
      id: 'MARK_ATTENDANCE',
      title: 'Mark Attendance',
      description: 'Mark student attendance',
      icon: '✓',
      route: '/teacher/attendance/mark',
      roles: ['TEACHER'],
      permission: 'ATTENDANCE_MARK',
      aliases: [
        'attendance',
        'mark attendance',
        'take attendance'
      ]
    }

  ];



  // =========================================================
  // QUICK ACTION SEARCH
  // =========================================================

  searchActions(
    query: string
  ): GlobalSearchResult[] {

    const normalizedQuery =
      query.trim().toLowerCase();

    const role =
      this.getRole();

    if (!role) {
      return [];
    }

    return this.quickActions
      .filter(action =>
        action.roles.includes(
          role as 'SUPER_ADMIN' | 'ADMIN' | 'TEACHER' | 'STUDENT'
        )
      )
      .filter(action => {

        if (
          action.permission &&
          !this.permissionService.hasPermission(
            action.permission
          )
        ) {
          return false;
        }

        if (!normalizedQuery) {
          return true;
        }
        const matchesTitle =
          action.title
            .toLowerCase()
            .includes(normalizedQuery);

        const matchesDescription =
          action.description
            .toLowerCase()
            .includes(normalizedQuery);

        const matchesAlias =
          action.aliases?.some(alias =>
            alias
              .toLowerCase()
              .includes(normalizedQuery)
          ) ?? false;

        return (
          matchesTitle ||
          matchesDescription ||
          matchesAlias
        );

      })
      .map(action => ({

        type: 'action' as const,

        title: action.title,

        subtitle: action.description,

        icon: action.icon,

        route: action.route

      }));

  }


  // =========================================================
  // PAGE SEARCH
  // =========================================================

  searchPages(
    query: string
  ): GlobalSearchResult[] {

    const normalizedQuery =
      query.trim().toLowerCase();

    if (!normalizedQuery) {
      return [];
    }

    return this.getNavigationItems()
      .filter(item =>
        item.label
          .toLowerCase()
          .includes(normalizedQuery)
      )
      .map(item => ({

        type: 'page' as const,

        title: item.label,

        subtitle: item.route,

        icon: item.icon,

        route: item.route

      }));
  }

  private rankResults(
    results: GlobalSearchResult[],
    query: string
  ): GlobalSearchResult[] {

    const normalizedQuery =
      query.trim().toLowerCase();

    if (!normalizedQuery) {
      return results;
    }

    const scoreResult = (
      result: GlobalSearchResult
    ): number => {

      const title =
        result.title?.toLowerCase() ?? '';

      const subtitle =
        result.subtitle?.toLowerCase() ?? '';

      const description =
        result.description?.toLowerCase() ?? '';

      const metadataText =
        result.metadata
          ?.map(item =>
            `${item.label} ${item.value}`
          )
          .join(' ')
          .toLowerCase() ?? '';

      // Exact title
      if (title === normalizedQuery) {
        return 1000;
      }

      // Title starts with query
      if (title.startsWith(normalizedQuery)) {
        return 800;
      }

      // Title contains query
      if (title.includes(normalizedQuery)) {
        return 600;
      }

      const normalizedSubtitle =
        subtitle
          .replace(/roll\s*no[:\s-]*/i, '')
          .replace(/teacher\s*no[:\s-]*/i, '')
          .trim();

      if (
        normalizedSubtitle === normalizedQuery
      ) {
        return 900;
      }

      if (
        normalizedSubtitle.startsWith(normalizedQuery)
      ) {
        return 700;
      }

      if (
        normalizedSubtitle.includes(normalizedQuery)
      ) {
        return 500;
      }

      if (subtitle.startsWith(normalizedQuery)) {
        return 450;
      }

      if (subtitle.includes(normalizedQuery)) {
        return 350;
      }

      // Description match
      if (description.includes(normalizedQuery)) {
        return 250;
      }

      // Metadata match
      if (metadataText.includes(normalizedQuery)) {
        return 150;
      }

      return 0;
    };

    return [...results]
      .map((result, index) => ({
        result,
        score: scoreResult(result),
        index
      }))
      .filter(item => item.score > 0)
      .sort((a, b) => {

        if (b.score !== a.score) {
          return b.score - a.score;
        }

        return a.index - b.index;
      })
      .map(item => item.result);
  }


  private searchAcademicRecords(
    query: string
  ): Observable<GlobalSearchResult[]> {

    const normalizedQuery =
      query.trim().toLowerCase();

    if (!normalizedQuery) {
      return of([]);
    }

    return forkJoin({
      classes: this.classService
        .getClasses()
        .pipe(
          catchError(() => of(null))
        ),

      subjects: this.subjectService
        .getSubjects()
        .pipe(
          catchError(() => of(null))
        )
    }).pipe(

      map(response => {

        const results: GlobalSearchResult[] = [];

        // =====================================================
        // CLASSES
        // =====================================================

        const classes =
          response.classes?.data ?? [];

        for (const academicClass of classes) {

          const searchableText = [
            academicClass.name,
            academicClass.academicYear
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();

          if (!searchableText.includes(normalizedQuery)) {
            continue;
          }

          results.push({
            type: 'page',
            id: academicClass.id,
            title: academicClass.name,
            subtitle:
              academicClass.academicYear
                ? `Academic Year: ${academicClass.academicYear}`
                : 'Class',
            description:
              'Academic class',
            icon: '▣',
            route: '/admin/academic',
            metadata: [
              {
                label: 'Academic Year',
                value:
                  academicClass.academicYear ?? 'N/A'
              }
            ]
          });
        }

        // =====================================================
        // SUBJECTS
        // =====================================================

        const subjects =
          response.subjects?.data ?? [];

        for (const subject of subjects) {

          const searchableText = [
            subject.name,
            subject.code,
            subject.className,
            subject.academicYear
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();

          if (!searchableText.includes(normalizedQuery)) {
            continue;
          }

          results.push({
            type: 'page',
            id: subject.id,
            title: subject.name,
            subtitle:
              `${subject.code} • ${subject.className}`,
            description:
              `Academic Year: ${subject.academicYear}`,
            icon: '▤',
            route: '/admin/academic',
            metadata: [
              {
                label: 'Code',
                value: subject.code
              },
              {
                label: 'Class',
                value: subject.className
              },
              {
                label: 'Academic Year',
                value: subject.academicYear
              }
            ]
          });
        }

        return this.rankResults(
          results,
          normalizedQuery
        );
      })
    );
  }

  // =========================================================
  // GLOBAL RECORD SEARCH
  // =========================================================

  searchRecords(
    query: string
  ): Observable<GlobalSearchResult[]> {

    const normalizedQuery =
      query.trim();

    if (!normalizedQuery) {
      return of([]);
    }

    const role =
      this.getRole();

    if (!role) {
      return of([]);
    }


    // =======================================================
    // ADMIN
    // =======================================================

if (role === 'ADMIN') {

  return forkJoin({

    students:
      this.studentService
        .getStudents(
          0,
          5,
          normalizedQuery
        )
        .pipe(
          catchError(() => of(null))
        ),

    teachers:
      this.teacherService
        .getTeachers(
          0,
          5,
          normalizedQuery
        )
        .pipe(
          catchError(() => of(null))
        ),

    academic:
      this.searchAcademicRecords(
        normalizedQuery
      )

  }).pipe(

    map(response => {

      const results:
        GlobalSearchResult[] = [];

      const students =
        response.students?.data?.content ?? [];

      for (const student of students) {

        results.push({

          type: 'student',

          id: student.id,

          title: student.name,

          subtitle:
            `${student.className} • Roll No: ${student.rollNumber}`,

          description:
            student.email,

          icon: '♙',

          route:
            `/admin/students/${student.id}/edit`,

          metadata: [

            {
              label: 'Class',
              value: student.className
            },

            {
              label: 'Section',
              value: student.sectionName
            },

            {
              label: 'Roll No',
              value: student.rollNumber
            },

            {
              label: 'Status',
              value:
                student.isActive
                  ? 'Active'
                  : 'Inactive'
            }

          ]

        });

      }

      const teachers =
        response.teachers?.data?.content ?? [];

      for (const teacher of teachers) {

        results.push({

          type: 'teacher',

          id: teacher.id,

          title:
            `${teacher.firstName} ${teacher.lastName}`.trim(),

          subtitle:
            `Teacher No: ${teacher.teacherNumber}`,

          description:
            teacher.email,

          icon: '♙',

          route:
            `/admin/teachers/${teacher.id}`,

          metadata: [

            {
              label: 'Teacher No',
              value: teacher.teacherNumber
            },

            {
              label: 'Phone',
              value: teacher.phone
            },

            {
              label: 'Status',
              value:
                teacher.isActive
                  ? 'Active'
                  : 'Inactive'
            }

          ]

        });

      }

      results.push(
        ...response.academic
      );

      return this.rankResults(
        results,
        normalizedQuery
      );

    })

  );
}


    // =======================================================
    // TEACHER
    // =======================================================

    if (role === 'TEACHER') {

      return this.teacherStudentService
        .getStudents({

          page: 0,

          size: 5,

          search: normalizedQuery,

          sortBy: 'name',

          sortDirection: 'asc'

        })
        .pipe(

          map(response => {
            const students =
              response?.data?.content ?? [];

            const results = students.map(student => ({
              type: 'student' as const,

              id:
                student.studentId,

              title: student.name,

              subtitle:
                `${student.className} • Roll No: ${student.rollNumber ?? 'N/A'
                }`,

              description:
                student.email ?? '',

              icon: '♙',

              route:
                `/teacher/students/${student.studentId}/edit`,

              metadata: [

                {
                  label: 'Class',
                  value: student.className
                },

                {
                  label: 'Section',
                  value: student.sectionName
                },

                {
                  label: 'Roll No',
                  value:
                    student.rollNumber ?? 'N/A'
                },

                {
                  label: 'Status',
                  value:
                    student.isActive
                      ? 'Active'
                      : 'Inactive'
                }

              ]

            }));

            return this.rankResults(
              results,
              normalizedQuery
            );
          }),

          catchError(() => of([]))

        );
    }


    // =======================================================
    // OTHER ROLES
    // =======================================================

    return of([]);
  }


  // =========================================================
  // STUDENT QUICK VIEW
  // =========================================================

  getStudentQuickView(
    studentId: number
  ): Observable<GlobalSearchStudentQuickView | null> {

    const role =
      this.getRole();

    if (
      role !== 'ADMIN' &&
      role !== 'TEACHER'
    ) {
      return of(null);
    }


    // =========================================================
    // ATTENDANCE REQUEST
    // =========================================================

    const attendanceRequest =
      this.attendanceService
        .getAttendanceByStudent(studentId)
        .pipe(

          catchError(() => of({

            success: false,

            message:
              'Attendance unavailable',

            data: []

          }))

        );


    // =========================================================
    // ADMIN
    // =========================================================

    if (role === 'ADMIN') {

      return forkJoin({

        student:
          this.studentService
            .getStudentById(studentId),

        attendance:
          attendanceRequest,

        fees:
          this.studentFeeService
            .getAll()
            .pipe(
              catchError(() => of({
                success: false,
                message: 'Fees unavailable',
                data: []
              }))
            )

      }).pipe(

        switchMap(response => {

          const studentResponse =
            response.student?.data;

          if (!studentResponse) {
            return of(null);
          }


          // -------------------------------------------------
          // STUDENT PROFILE
          // -------------------------------------------------

          const student = {

            id:
              studentResponse.id,

            name: studentResponse.name,

            email:
              studentResponse.email,

            phone:
              studentResponse.phone,

            alternatePhone:
              studentResponse.alternatePhone,

            address:
              studentResponse.address,

            rollNumber:
              studentResponse.rollNumber,

            enrollmentNumber:
              studentResponse.enrollmentNumber,

            className:
              studentResponse.className,

            sectionName:
              studentResponse.sectionName,

            academicYearName:
              studentResponse.academicYearName,

            gender:
              studentResponse.gender,

            boardMediumName:
              studentResponse.boardMediumName,

            branchName:
              studentResponse.branchName,

            isActive:
              studentResponse.isActive

          };


          // -------------------------------------------------
          // ATTENDANCE
          // -------------------------------------------------

          const attendance =
            response.attendance?.data ?? [];


          // -------------------------------------------------
          // STUDENT FEES
          // -------------------------------------------------

          const studentFees =
            (response.fees?.data ?? [])
              .filter(
                fee =>
                  fee.studentId === studentId
              );


          // -------------------------------------------------
          // NO FEES
          // -------------------------------------------------

          if (!studentFees.length) {

            return of(
              this.buildStudentQuickView(
                student,
                attendance,
                []
              )
            );
          }


          // -------------------------------------------------
          // PAYMENT HISTORY
          // -------------------------------------------------

          return forkJoin(

            studentFees.map(fee =>

              this.studentFeeService
                .getPayments(fee.id)
                .pipe(
                  catchError(() => of([]))
                )

            )

          ).pipe(

            map(paymentLists => {

              const fees =
                studentFees.map(
                  (fee, index) => {

                    const payments =
                      paymentLists[index] ?? [];


                    return {

                      id:
                        fee.id,

                      originalAmount:
                        Number(
                          fee.originalAmount
                        ),

                      discountAmount:
                        Number(
                          fee.discountAmount
                        ),

                      payableAmount:
                        Number(
                          fee.payableAmount
                        ),

                      paidAmount:
                        Number(
                          fee.paidAmount
                        ),

                      remainingAmount:
                        Number(
                          fee.remainingAmount
                        ),

                      status:
                        fee.status,

                      payments:
                        payments.map(
                          payment => ({

                            amount:
                              Number(
                                payment.amount
                              ),

                            paymentDate:
                              payment.paymentDate,

                            paymentMethod:
                              payment.paymentMethod,

                            paymentType:
                              payment.paymentType,

                            status:
                              payment.status

                          })
                        )

                    };

                  }

                );


              return this.buildStudentQuickView(
                student,
                attendance,
                fees
              );

            })

          );

        }),

        catchError(() => of(null))

      );
    }


    // =========================================================
    // TEACHER
    // =========================================================

    if (role === 'TEACHER') {

      return this.teacherStudentService
        .getStudentById(studentId)
        .pipe(

          switchMap(response => {

            const student =
              response?.data;

            if (!student) {
              return of(null);
            }


            return attendanceRequest.pipe(

              map(attendanceResponse => {

                const studentData = {

                  id:
                    student.studentId,

                  name: student.name,

                  email:
                    student.email,

                  phone:
                    student.phone,

                  alternatePhone:
                    student.alternatePhone,

                  address:
                    student.address,

                  rollNumber:
                    student.rollNumber,

                  enrollmentNumber:
                    student.enrollmentNumber,

                  className:
                    student.className,

                  sectionName:
                    student.sectionName,

                  academicYearName:
                    student.academicYearName,

                  isActive:
                    student.isActive

                };


                return this.buildStudentQuickView(

                  studentData,

                  attendanceResponse?.data ?? [],

                  []

                );

              })

            );

          }),

          catchError(() => of(null))

        );
    }


    // =========================================================
    // FALLBACK
    // =========================================================

    return of(null);
  }

  // =========================================================
  // TEACHER QUICK VIEW
  // =========================================================

  getTeacherQuickView(
    teacherId: number
  ): Observable<GlobalSearchTeacherQuickView | null> {

    const teacherRequest =
      this.teacherService
        .getTeacherById(teacherId)
        .pipe(
          map(response => response?.data ?? null),
          catchError(() => of(null))
        );

    const assignmentRequest =
      this.teacherRoleAssignmentService
        .getAssignmentByTeacherId(teacherId)
        .pipe(
          map(response => response?.data ?? null),
          catchError(() => of(null))
        );

    return forkJoin({
      teacher: teacherRequest,
      assignment: assignmentRequest
    }).pipe(

      switchMap(({ teacher, assignment }) => {

        if (!teacher) {
          return of(null);
        }

        // -------------------------------------------------------
        // NO ROLE ASSIGNMENT
        // -------------------------------------------------------

        if (!assignment) {

          return of({
            id: teacher.id,

            name:
              `${teacher.firstName} ${teacher.lastName}`.trim(),

            teacherNumber:
              teacher.teacherNumber,

            email:
              teacher.email,

            phone:
              teacher.phone,

            isActive:
              teacher.isActive,

            assignments: [],

            permissions: []
          });

        }

        // -------------------------------------------------------
        // ROLE DETAILS
        // -------------------------------------------------------

        return this.teacherRoleService
          .getRoleById(assignment.teacherRoleId)
          .pipe(

            map(roleResponse => {

              const role =
                roleResponse?.data ?? null;

              return {

                id: teacher.id,

                name:
                  `${teacher.firstName} ${teacher.lastName}`.trim(),

                teacherNumber:
                  teacher.teacherNumber,

                email:
                  teacher.email,

                phone:
                  teacher.phone,

                isActive:
                  teacher.isActive,

                role: role
                  ? {
                    id: role.id,
                    name: role.name,
                    description: role.description,
                    isActive: role.isActive
                  }
                  : undefined,

                assignments:
                  assignment.scopes?.map(scope => ({
                    academicYearName:
                      scope.academicYearName,

                    scopeType:
                      scope.scopeType,

                    className:
                      scope.className,

                    sectionName:
                      scope.sectionName
                  })) ?? [],

                permissions:
                  role?.permissions?.map(permission => ({
                    id: permission.id,
                    code: permission.code,
                    name: permission.name,
                    description: permission.description
                  })) ?? []

              } satisfies GlobalSearchTeacherQuickView;

            }),

            catchError(() => of({

              id: teacher.id,

              name:
                `${teacher.firstName} ${teacher.lastName}`.trim(),

              teacherNumber:
                teacher.teacherNumber,

              email:
                teacher.email,

              phone:
                teacher.phone,

              isActive:
                teacher.isActive,

              role: {
                id: assignment.teacherRoleId,
                name: assignment.teacherRoleName
              },

              assignments:
                assignment.scopes?.map(scope => ({
                  academicYearName:
                    scope.academicYearName,

                  scopeType:
                    scope.scopeType,

                  className:
                    scope.className,

                  sectionName:
                    scope.sectionName
                })) ?? [],

              permissions: []

            } satisfies GlobalSearchTeacherQuickView))

          );

      }),

      catchError(() => of(null))

    );
  }


  // =========================================================
  // BUILD STUDENT QUICK VIEW
  // =========================================================

  private buildStudentQuickView(

    student: {
      id: number;
      name: string;
      email?: string | null;
      phone?: string | null;
      alternatePhone?: string | null;
      address?: string | null;
      rollNumber?: string | null;
      enrollmentNumber?: string | null;
      className?: string | null;
      sectionName?: string | null;
      academicYearName?: string | null;
      gender?: string | null;
      boardMediumName?: string | null;
      branchName?: string | null;
      isActive?: boolean | null;
    },

    attendance: Attendance[],

    fees: GlobalSearchStudentQuickView['fees']

  ): GlobalSearchStudentQuickView {


    // =======================================================
    // ATTENDANCE SUMMARY
    // =======================================================

    const total =
      attendance.length;

    const present =
      attendance.filter(
        item =>
          item.status === 'PRESENT'
      ).length;

    const absent =
      attendance.filter(
        item =>
          item.status === 'ABSENT'
      ).length;

    const percentage =
      total > 0

        ? Number(
          (
            (present / total) *
            100
          ).toFixed(1)
        )

        : 0;


    // =======================================================
    // RECENT ATTENDANCE
    // =======================================================

    const recent =
      [...attendance]

        .sort(
          (a, b) =>
            new Date(
              b.attendanceDate
            ).getTime() -
            new Date(
              a.attendanceDate
            ).getTime()
        )

        .slice(0, 5)

        .map(item => ({

          date:
            item.attendanceDate,

          status:
            item.status

        }));


    // =======================================================
    // FINAL QUICK VIEW
    // =======================================================

    return {

      id:
        student.id,

      name: student.name,

      email:
        student.email ?? undefined,

      phone:
        student.phone ?? undefined,

      alternatePhone:
        student.alternatePhone ?? undefined,

      address:
        student.address ?? undefined,

      rollNumber:
        student.rollNumber ?? undefined,

      enrollmentNumber:
        student.enrollmentNumber ?? undefined,

      className:
        student.className ?? undefined,

      sectionName:
        student.sectionName ?? undefined,

      academicYearName:
        student.academicYearName ?? undefined,

      gender:
        student.gender ?? undefined,

      boardMediumName:
        student.boardMediumName ?? undefined,

      branchName:
        student.branchName ?? undefined,

      isActive:
        student.isActive ?? undefined,


      // -----------------------------------------------------
      // ATTENDANCE
      // -----------------------------------------------------

      attendance: {

        total,

        present,

        absent,

        percentage,

        recent

      },


      // -----------------------------------------------------
      // FEES
      // -----------------------------------------------------

      fees

    };
  }


  // =========================================================
  // BACKWARD COMPATIBILITY
  // =========================================================

  search(
    query: string
  ): NavigationItem[] {

    const normalizedQuery =
      query.trim().toLowerCase();

    if (!normalizedQuery) {
      return [];
    }

    return this.getNavigationItems()
      .filter(item =>
        item.label
          .toLowerCase()
          .includes(normalizedQuery)
      );
  }

}
