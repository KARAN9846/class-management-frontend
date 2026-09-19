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

import { StudentService } from '../../features/admin/students/services/student.service';
import { TeacherService } from '../../features/admin/teachers/services/teacher.service';
import { TeacherStudentService } from '../../features/teacher/students/services/teacher-student.service';

import {
GlobalSearchResult,
GlobalSearchStudentQuickView,
GlobalSearchTeacherQuickView
} from '../../shared/components/global-search/global-search.models';

import { TeacherRoleAssignmentService } from '../../features/admin/teacher-role-assignments/services/teacher-role-assignment.service';
import { TeacherRoleService } from '../../features/admin/teacher-roles/services/teacher-role.service';


@Injectable({
  providedIn: 'root'
})
export class GlobalSearchService {

  private readonly tokenService =
    inject(TokenService);

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
            )

      }).pipe(

        map(response => {

          const results:
            GlobalSearchResult[] = [];


          // -------------------------------------------------
          // STUDENTS
          // -------------------------------------------------

          const students =
            response.students?.data?.content ?? [];

          for (const student of students) {

            results.push({

              type: 'student',

              id: student.id,

              title:
                `${student.firstName} ${student.lastName}`.trim(),

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


          // -------------------------------------------------
          // TEACHERS
          // -------------------------------------------------

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


          return results;

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

          sortBy: 'firstName',

          sortDirection: 'asc'

        })
        .pipe(

          map(response => {

            const students =
              response?.data?.content ?? [];

            return students.map(student => ({

              type: 'student' as const,

              id:
                student.studentId,

              title:
                `${student.firstName} ${student.lastName}`.trim(),

              subtitle:
                `${student.className} • Roll No: ${
                  student.rollNumber ?? 'N/A'
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

                message:
                  'Fees unavailable',

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

            firstName:
              studentResponse.firstName,

            lastName:
              studentResponse.lastName,

            email:
              studentResponse.email,

            phone:
              studentResponse.phone,

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

                  firstName:
                    student.firstName,

                  lastName:
                    student.lastName,

                  email:
                    student.email,

                  phone:
                    student.phone,

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
      firstName: string;
      lastName: string;
      email?: string | null;
      phone?: string | null;
      rollNumber?: string | null;
      enrollmentNumber?: string | null;
      className?: string | null;
      sectionName?: string | null;
      academicYearName?: string | null;
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

      name:
        `${student.firstName} ${student.lastName}`.trim(),

      email:
        student.email ?? undefined,

      phone:
        student.phone ?? undefined,

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