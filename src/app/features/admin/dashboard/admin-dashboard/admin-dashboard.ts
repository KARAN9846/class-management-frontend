import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';

import {
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  ChartData,
  ChartOptions,
  DoughnutController,
  LinearScale,
  LineController,
  LineElement,
  Legend,
  PointElement,
  Tooltip
} from 'chart.js';

import { BaseChartDirective } from 'ng2-charts';

import { DashboardService } from '../services/dashboard.service';

import {
  AcademicStructureDashboardData,
  StudentDashboardData,
  AssignmentDashboardData,
  TeacherDashboardData,
  AttendanceDashboardData,
  FinanceDashboardData
} from '../models/dashboard.model';


/*
 * Register the Chart.js components required by the dashboard.
 *
 * Student / Teacher:
 * - Doughnut
 *
 * Attendance:
 * - Line
 * - Bar
 * - Doughnut
 */
Chart.register(
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  DoughnutController,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
  Legend
);


interface SubjectCoverage {
  name: string;
  classCount: number;
  percentage: number;
}


@Component({
  selector: 'app-admin-dashboard',
  imports: [
    BaseChartDirective,
    DecimalPipe,
    DatePipe
  ],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss',
})
export class AdminDashboard implements OnInit {

  private readonly dashboardService = inject(DashboardService);
  private readonly router = inject(Router);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);


  // =========================================================
  // DASHBOARD DATA
  // =========================================================

  studentDashboard: StudentDashboardData | null = null;

  teacherDashboard: TeacherDashboardData | null = null;

  academicStructureDashboard:
    AcademicStructureDashboardData | null = null;

  assignmentDashboard:
    AssignmentDashboardData | null = null;

  attendanceDashboard:
    AttendanceDashboardData | null = null;

  expandedClassId: number | null = null;

  subjectCoverage: SubjectCoverage[] = [];

  financeDashboard: FinanceDashboardData | null = null;

financeLoading = false;
financeError = false;


  // =========================================================
  // DASHBOARD STATE
  // =========================================================

  loading = true;

  error = '';


  // =========================================================
  // STUDENT / TEACHER CHART TYPES
  // =========================================================

  doughnutChartType: 'doughnut' = 'doughnut';

  teacherDoughnutChartType: 'doughnut' = 'doughnut';


  // =========================================================
  // STUDENT STATUS DOUGHNUT
  // =========================================================

  doughnutChartData: ChartData<'doughnut'> = {

    labels: [
      'Active',
      'Inactive'
    ],

    datasets: [
      {
        data: [
          0,
          0
        ],

        backgroundColor: [
          '#16a34a',
          '#ea580c'
        ],

        borderColor: '#ffffff',

        borderWidth: 2
      }
    ]
  };


  doughnutChartOptions:
    ChartOptions<'doughnut'> = {

    responsive: true,

    maintainAspectRatio: false,

    cutout: '70%',

    plugins: {

      legend: {
        display: false
      },

      tooltip: {
        enabled: true
      }
    }
  };


  // =========================================================
  // TEACHER STATUS DOUGHNUT
  // =========================================================

  teacherDoughnutChartData:
    ChartData<'doughnut'> = {

    labels: [
      'Active',
      'Inactive'
    ],

    datasets: [
      {
        data: [
          0,
          0
        ],

        backgroundColor: [
          '#16a34a',
          '#ea580c'
        ],

        borderColor: '#ffffff',

        borderWidth: 2
      }
    ]
  };


  teacherDoughnutChartOptions:
    ChartOptions<'doughnut'> = {

    responsive: true,

    maintainAspectRatio: false,

    cutout: '70%',

    plugins: {

      legend: {
        display: false
      },

      tooltip: {
        enabled: true
      }
    }
  };


  // =========================================================
  // ATTENDANCE — MONTHLY LINE CHART
  // =========================================================
  //
  // X axis:
  //     Attendance date
  //
  // Y axis:
  //     Number of students
  //
  // Series:
  //     Present
  //     Absent
  //
  // Color:
  //     Green = Present
  //     Orange = Absent
  // =========================================================

  attendanceTrendChartData:
    ChartData<'line'> = {

    labels: [],

    datasets: [

      {
        label: 'Present',

        data: [],

        borderColor: '#16a34a',

        backgroundColor: 'rgba(22, 163, 74, 0.10)',

        pointBackgroundColor: '#16a34a',

        pointBorderColor: '#ffffff',

        pointBorderWidth: 2,

        pointRadius: 4,

        pointHoverRadius: 6,

        borderWidth: 2,

        tension: 0.35,

        fill: false
      },

      {
        label: 'Absent',

        data: [],

        borderColor: '#ea580c',

        backgroundColor: 'rgba(234, 88, 12, 0.10)',

        pointBackgroundColor: '#ea580c',

        pointBorderColor: '#ffffff',

        pointBorderWidth: 2,

        pointRadius: 4,

        pointHoverRadius: 6,

        borderWidth: 2,

        tension: 0.35,

        fill: false
      }

    ]
  };


  attendanceTrendChartOptions:
    ChartOptions<'line'> = {

    responsive: true,

    maintainAspectRatio: false,

    interaction: {
      mode: 'index',
      intersect: false
    },

    plugins: {

      legend: {
        display: true,
        position: 'top'
      },

      tooltip: {
        enabled: true
      }
    },

    scales: {

      x: {
        grid: {
          display: false
        }
      },

      y: {

        beginAtZero: true,

        ticks: {
          precision: 0
        },

        title: {
          display: true,
          text: 'Students'
        }
      }
    }
  };


  // =========================================================
  // ATTENDANCE — CLASS-WISE VERTICAL BAR CHART
  // =========================================================
  //
  // X axis:
  //     Class
  //
  // Y axis:
  //     Attendance %
  //
  // Different color per class is generated dynamically.
  // =========================================================

  attendanceClassChartData:
    ChartData<'bar'> = {

    labels: [],

    datasets: [
      {
        label: 'Attendance Rate',

        data: [],

        backgroundColor: [],

        borderColor: [],

        borderWidth: 1,

        borderRadius: 6,

        borderSkipped: false
      }
    ]
  };


  attendanceClassChartOptions:
    ChartOptions<'bar'> = {

    responsive: true,

    maintainAspectRatio: false,

    plugins: {

      legend: {
        display: false
      },

      tooltip: {
        callbacks: {

          label: (context) => {

            const value =
              context.parsed.y ?? 0;

            return ` Attendance: ${value.toFixed(1)}%`;
          }
        }
      }
    },

    scales: {

      x: {

        grid: {
          display: false
        },

        ticks: {
          autoSkip: false
        }
      },

      y: {

        beginAtZero: true,

        max: 100,

        ticks: {

          callback: (value) =>
            `${value}%`
        },

        title: {
          display: true,
          text: 'Attendance Rate'
        }
      }
    }
  };


  // =========================================================
  // ATTENDANCE — PRESENT / ABSENT DOUGHNUT
  // =========================================================

  attendanceCompositionChartData:
    ChartData<'doughnut'> = {

    labels: [
      'Present',
      'Absent'
    ],

    datasets: [
      {
        data: [
          0,
          0
        ],

        backgroundColor: [
          '#16a34a',
          '#f97316'
        ],

        borderColor: '#ffffff',

        borderWidth: 2,

        hoverOffset: 5
      }
    ]
  };


  attendanceCompositionChartOptions:
    ChartOptions<'doughnut'> = {

    responsive: true,

    maintainAspectRatio: false,

    cutout: '70%',

    plugins: {

      legend: {
        display: true,
        position: 'bottom'
      },

      tooltip: {
        enabled: true,

        callbacks: {

          label: (context) => {

            const value =
              context.parsed ?? 0;

            return ` ${context.label}: ${value}`;
          }
        }
      }
    }
  };


  // =========================================================
  // ATTENDANCE — MONTHLY CLASS BAR CHART
  // =========================================================
  //
  // Vertical grouped bars:
  //
  // Green  = Present
  // Orange = Absent
  // =========================================================

  attendanceMonthlyClassChartData:
    ChartData<'bar'> = {

    labels: [],

    datasets: [

      {
        label: 'Present',

        data: [],

        backgroundColor: '#16a34a',

        borderColor: '#15803d',

        borderWidth: 1,

        borderRadius: 5
      },

      {
        label: 'Absent',

        data: [],

        backgroundColor: '#f97316',

        borderColor: '#ea580c',

        borderWidth: 1,

        borderRadius: 5
      }

    ]
  };


  attendanceMonthlyClassChartOptions:
    ChartOptions<'bar'> = {

    responsive: true,

    maintainAspectRatio: false,

    interaction: {
      mode: 'index',
      intersect: false
    },

    plugins: {

      legend: {
        display: true,
        position: 'top'
      },

      tooltip: {
        enabled: true
      }
    },

    scales: {

      x: {

        grid: {
          display: false
        }
      },

      y: {

        beginAtZero: true,

        ticks: {
          precision: 0
        },

        title: {
          display: true,
          text: 'Students'
        }
      }
    }
  };


  // =========================================================
  // INITIALIZATION
  // =========================================================

  ngOnInit(): void {

    this.loadDashboard();

    this.loadAcademicStructureDashboard();

    this.loadAssignmentDashboard();

    this.loadAttendanceDashboard();

    this.loadFinanceDashboard();
  }


  // =========================================================
  // STUDENT + TEACHER DASHBOARD
  // =========================================================

  private loadDashboard(): void {

    this.loading = true;

    this.error = '';


    this.dashboardService
      .getStudentDashboard()
      .subscribe({

        next: (response) => {

          this.studentDashboard =
            response.data;


          // -------------------------------------------------
          // STUDENT STATUS CHART
          // -------------------------------------------------

          this.doughnutChartData = {

            labels: [
              'Active',
              'Inactive'
            ],

            datasets: [

              {
                data: [

                  response.data.activeStudents,

                  response.data.inactiveStudents

                ],

                backgroundColor: [
                  '#16a34a',
                  '#ea580c'
                ],

                borderColor: '#ffffff',

                borderWidth: 2
              }

            ]
          };


          // -------------------------------------------------
          // LOAD TEACHER DASHBOARD
          // -------------------------------------------------

          this.dashboardService
            .getTeacherDashboard()
            .subscribe({

              next: (teacherResponse) => {

                this.teacherDashboard =
                  teacherResponse.data;


                // -------------------------------------------
                // TEACHER STATUS CHART
                // -------------------------------------------

                this.teacherDoughnutChartData = {

                  labels: [
                    'Active',
                    'Inactive'
                  ],

                  datasets: [

                    {
                      data: [

                        teacherResponse
                          .data
                          .activeTeachers,

                        teacherResponse
                          .data
                          .inactiveTeachers

                      ],

                      backgroundColor: [
                        '#16a34a',
                        '#ea580c'
                      ],

                      borderColor: '#ffffff',

                      borderWidth: 2
                    }

                  ]
                };


                this.loading = false;

                this.changeDetectorRef
                  .detectChanges();
              },


              error: (error) => {

                console.error(
                  'Failed to load teacher dashboard data:',
                  error
                );

                this.error =
                  'Failed to load teacher dashboard data.';

                this.loading = false;

                this.changeDetectorRef
                  .detectChanges();
              }
            });
        },


        error: (error) => {

          console.error(
            'Failed to load student dashboard data:',
            error
          );

          this.error =
            'Failed to load student dashboard data.';

          this.loading = false;

          this.changeDetectorRef
            .detectChanges();
        }
      });
  }


  // =========================================================
  // ACADEMIC STRUCTURE
  // =========================================================

  private loadAcademicStructureDashboard(): void {

    this.dashboardService
      .getAcademicStructureDashboard()
      .subscribe({

        next: (response) => {

          this.academicStructureDashboard =
            response.data;

          this.subjectCoverage =
            this.buildSubjectCoverage(
              response.data
            );

          this.changeDetectorRef
            .detectChanges();
        },


        error: (error) => {

          console.error(
            'Failed to load academic structure dashboard data:',
            error
          );
        }
      });
  }


  // =========================================================
  // ASSIGNMENT DASHBOARD
  // =========================================================

  private loadAssignmentDashboard(): void {

    this.dashboardService
      .getAssignmentDashboard()
      .subscribe({

        next: (response) => {

          this.assignmentDashboard =
            response.data;

          this.changeDetectorRef
            .detectChanges();
        },


        error: (error) => {

          console.error(
            'Failed to load assignment dashboard data:',
            error
          );
        }
      });
  }


  // =========================================================
  // ATTENDANCE DASHBOARD
  // =========================================================

  loadAttendanceDashboard(): void {

    this.dashboardService
      .getAttendanceDashboard()
      .subscribe({

        next: (response) => {

          this.attendanceDashboard =
            response.data;


          // -------------------------------------------------
          // UPDATE ALL ATTENDANCE CHARTS
          // -------------------------------------------------

          this.updateAttendanceCharts(
            response.data
          );


          this.changeDetectorRef
            .detectChanges();
        },


        error: (error) => {

          console.error(
            'Failed to load attendance dashboard:',
            error
          );

          this.attendanceDashboard =
            null;

          this.changeDetectorRef
            .detectChanges();
        }
      });
  }


  // =========================================================
  // UPDATE ATTENDANCE CHARTS
  // =========================================================

  private updateAttendanceCharts(
    dashboard: AttendanceDashboardData
  ): void {


    // =======================================================
    // 1. MONTHLY DAILY LINE CHART
    // =======================================================

    this.attendanceTrendChartData = {

      labels:
        dashboard.monthlyTrend.map(
          item => this.formatChartDate(
            item.date
          )
        ),

      datasets: [

        {
          label: 'Present',

          data:
            dashboard.monthlyTrend.map(
              item => item.present
            ),

          borderColor: '#16a34a',

          backgroundColor:
            'rgba(22, 163, 74, 0.10)',

          pointBackgroundColor:
            '#16a34a',

          pointBorderColor:
            '#ffffff',

          pointBorderWidth: 2,

          pointRadius: 4,

          pointHoverRadius: 6,

          borderWidth: 2,

          tension: 0.35,

          fill: false
        },

        {
          label: 'Absent',

          data:
            dashboard.monthlyTrend.map(
              item => item.absent
            ),

          borderColor: '#ea580c',

          backgroundColor:
            'rgba(234, 88, 12, 0.10)',

          pointBackgroundColor:
            '#ea580c',

          pointBorderColor:
            '#ffffff',

          pointBorderWidth: 2,

          pointRadius: 4,

          pointHoverRadius: 6,

          borderWidth: 2,

          tension: 0.35,

          fill: false
        }

      ]
    };


    // =======================================================
    // 2. CLASS-WISE VERTICAL BAR CHART
    // =======================================================

    const classColors = [
      '#2563eb',
      '#7c3aed',
      '#0891b2',
      '#db2777',
      '#16a34a',
      '#ea580c',
      '#ca8a04',
      '#4f46e5'
    ];


    const classBorderColors = [
      '#1d4ed8',
      '#6d28d9',
      '#0e7490',
      '#be185d',
      '#15803d',
      '#c2410c',
      '#a16207',
      '#4338ca'
    ];


    this.attendanceClassChartData = {

      labels:
        dashboard.classSummaries.map(
          item => item.className
        ),

      datasets: [

        {
          label: 'Attendance Rate',

          data:
            dashboard.classSummaries.map(
              item => item.attendanceRate
            ),

          backgroundColor:
            dashboard.classSummaries.map(
              (_, index) =>
                classColors[
                  index % classColors.length
                ]
            ),

          borderColor:
            dashboard.classSummaries.map(
              (_, index) =>
                classBorderColors[
                  index % classBorderColors.length
                ]
            ),

          borderWidth: 1,

          borderRadius: 6,

          borderSkipped: false
        }

      ]
    };


    // =======================================================
    // 3. PRESENT VS ABSENT DOUGHNUT
    // =======================================================

    const monthlySummary =
      dashboard.selectedClassMonthlySummary;


    this.attendanceCompositionChartData = {

      labels: [
        'Present',
        'Absent'
      ],

      datasets: [

        {
          data: monthlySummary
            ? [
                monthlySummary.present,
                monthlySummary.absent
              ]
            : [0, 0],

          backgroundColor: [
            '#16a34a',
            '#f97316'
          ],

          borderColor: '#ffffff',

          borderWidth: 2,

          hoverOffset: 5
        }

      ]
    };


    // =======================================================
    // 4. MONTHLY PRESENT / ABSENT BY CLASS
    // =======================================================

    this.attendanceMonthlyClassChartData = {

      labels:
        dashboard.classSummaries.map(
          item => item.className
        ),

      datasets: [

        {
          label: 'Present',

          data:
            dashboard.classSummaries.map(
              item => item.present
            ),

          backgroundColor: '#16a34a',

          borderColor: '#15803d',

          borderWidth: 1,

          borderRadius: 5
        },

        {
          label: 'Absent',

          data:
            dashboard.classSummaries.map(
              item => item.absent
            ),

          backgroundColor: '#f97316',

          borderColor: '#ea580c',

          borderWidth: 1,

          borderRadius: 5
        }

      ]
    };
  }


  // =========================================================
  // CHART DATE FORMATTER
  // =========================================================

  private formatChartDate(
    date: string
  ): string {

    const parsedDate =
      new Date(`${date}T00:00:00`);

    return parsedDate.toLocaleDateString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short'
      }
    );
  }


  // =========================================================
  // SUBJECT COVERAGE
  // =========================================================

  private buildSubjectCoverage(
    data: AcademicStructureDashboardData
  ): SubjectCoverage[] {

    const coverage =
      new Map<string, number>();


    for (const classItem of data.classes) {

      for (const subject of classItem.subjects) {

        coverage.set(
          subject.name,
          (coverage.get(subject.name) ?? 0) + 1
        );
      }
    }


    return Array
      .from(coverage.entries())

      .map(
        ([name, classCount]) => ({

          name,

          classCount,

          percentage:
            data.totalClasses > 0
              ? Math.round(
                  (classCount /
                    data.totalClasses) *
                  100
                )
              : 0
        })
      )

      .sort(
        (a, b) =>
          b.classCount -
          a.classCount
      );
  }


  // =========================================================
  // NAVIGATION
  // =========================================================

  viewAllStudents(): void {

    this.router.navigate([
      '/admin/students'
    ]);
  }


  viewAllTeachers(): void {

    this.router.navigate([
      '/admin/teachers'
    ]);
  }


  viewAllAttendance(): void {

    this.router.navigate([
      '/admin/attendance'
    ]);
  }


  toggleClass(
    classId: number
  ): void {

    this.expandedClassId =
      this.expandedClassId === classId
        ? null
        : classId;
  }


  viewAcademicStructure(): void {

    console.log(
      'Academic Structure View All clicked'
    );


    this.router
      .navigate([
        '/admin/classes'
      ])
      .then(

        (success) =>
          console.log(
            'Navigation result:',
            success
          ),

        (error) =>
          console.error(
            'Navigation error:',
            error
          )
      );
  }


  viewAllAssignments(): void {

    this.router.navigate([
      '/admin/assignments'
    ]);
  }

private loadFinanceDashboard(): void {
  this.financeLoading = true;
  this.financeError = false;

  this.dashboardService.getFinanceDashboard().subscribe({
    next: (response) => {
      this.financeDashboard = response.data;
      this.financeLoading = false;
      this.financeError = false;

      // Required for Angular zoneless change detection
      this.changeDetectorRef.detectChanges();
    },

    error: (error) => {
      console.error('Failed to load finance dashboard:', error);

      this.financeDashboard = null;
      this.financeLoading = false;
      this.financeError = true;

      // Required for Angular zoneless change detection
      this.changeDetectorRef.detectChanges();
    }
  });
}

get financeClassLabels(): string[] {
  return this.financeDashboard?.classWiseSummary
    ?.map(item => item.className) ?? [];
}

get financeClassCollected(): number[] {
  return this.financeDashboard?.classWiseSummary
    ?.map(item => item.collectedAmount) ?? [];
}

get financeClassPending(): number[] {
  return this.financeDashboard?.classWiseSummary
    ?.map(item => item.pendingAmount) ?? [];
}

get financeMonthlyLabels(): string[] {
  return this.financeDashboard?.monthlySummary
    ?.map(item => item.monthName) ?? [];
}

get financeMonthlyCollected(): number[] {
  return this.financeDashboard?.monthlySummary
    ?.map(item => item.collectedAmount) ?? [];
}

viewAllFinance(): void {
  this.router.navigate(['/admin/fees/student-fees']);
}

}