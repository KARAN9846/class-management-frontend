import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { StudentService } from '../../students/services/student.service';
import { AttendanceService } from '../../attendance/services/attendance.service';
import { StudentFeeService } from '../../fees/services/student-fee.service';

import { AcademicYearService } from '../../academic/academic-years/services/academic-year.service';
import { ClassService } from '../../academic/classes/class.service';
import { SectionService } from '../../academic/classes/section.service';

import { Student } from '../../students/models/student.model';
import { Attendance } from '../../attendance/models/attendance.model';
import { StudentFee } from '../../fees/models/student-fee.model';
import { AcademicClass } from '../../academic/classes/class.model';

import { ChangeDetectorRef } from '@angular/core';

import { BaseChartDirective } from 'ng2-charts';
import {
    ChartConfiguration,
    ChartData,
    ChartType,
    ChartOptions
} from 'chart.js';


// =============================================================
// REPORT ROW
// =============================================================

interface StudentReportRow {

    student: Student;

    attendancePercentage: number;

    presentCount: number;

    absentCount: number;

    totalFee: number;

    paidAmount: number;

    outstandingAmount: number;

    feeStatus:
    | 'PAID'
    | 'PARTIALLY_PAID'
    | 'UNPAID';

    risk:
    | 'LOW'
    | 'MEDIUM'
    | 'HIGH';
}


// =============================================================
// COLUMN
// =============================================================

interface ColumnDefinition {

    key: string;

    label: string;

    visible: boolean;
}


// =============================================================
// COMPONENT
// =============================================================

@Component({
    selector: 'app-students-insider',

    standalone: true,

    imports: [
        CommonModule,
        FormsModule,
        DecimalPipe,
        BaseChartDirective
    ],

    templateUrl: './students-insider.html',

    styleUrl: './students-insider.scss'
})
export class StudentsInsider implements OnInit {

    constructor(
        private cdr: ChangeDetectorRef
    ) { }


    // =========================================================
    // SERVICES
    // =========================================================

    private readonly studentService =
        inject(StudentService);

    private readonly attendanceService =
        inject(AttendanceService);

    private readonly studentFeeService =
        inject(StudentFeeService);

    private readonly academicYearService =
        inject(AcademicYearService);

    private readonly classService =
        inject(ClassService);

    private readonly sectionService =
        inject(SectionService);

    // =========================================================
    // PAGE STATE
    // =========================================================

    loading = false;

    errorMessage = '';


    // =========================================================
    // RAW DATA
    // =========================================================

    students: Student[] = [];

    attendanceRecords: Attendance[] = [];

    studentFees: StudentFee[] = [];


    // =========================================================
    // COMBINED REPORT DATA
    // =========================================================

    reportRows: StudentReportRow[] = [];

    filteredRows: StudentReportRow[] = [];

    paginatedRows: StudentReportRow[] = [];

    reportFilteredRows: StudentReportRow[] = [];

    reportPaginatedRows: StudentReportRow[] = [];

    


    // =========================================================
    // REPORT DATA
    // =========================================================

    reportStudents: Student[] = [];

    reportAttendance: Attendance[] = [];

    reportFees: StudentFee[] = [];

    reportLoading = false;

    reportSearch = '';

    reportAcademicYearId: number | null = null;

    reportClassId: number | null = null;

    reportSectionId: number | null = null;


    reportStudentStatus:
        | 'ALL'
        | 'ACTIVE'
        | 'INACTIVE' = 'ALL';


    reportAttendanceFilter:
        | 'ALL'
        | 'EXCELLENT'
        | 'GOOD'
        | 'NEEDS_ATTENTION'
        | 'CRITICAL'
        | 'LOW'
        | 'NO_DATA' = 'ALL';


    reportFeeFilter:
        | 'ALL'
        | 'PAID'
        | 'PARTIALLY_PAID'
        | 'UNPAID'
        | 'REMAINING' = 'ALL';


    reportPage = 0;

    reportPageSize = 25;

    reportTotalElements = 0;

    reportTotalPages = 1;


    // =========================================================
    // REPORT COLUMNS
    // =========================================================

    reportColumns: ColumnDefinition[] = [

        {
            key: 'student',
            label: 'Student',
            visible: true
        },

        {
            key: 'class',
            label: 'Class',
            visible: true
        },

        {
            key: 'section',
            label: 'Section',
            visible: true
        },

        {
            key: 'attendance',
            label: 'Attendance %',
            visible: true
        },

        {
            key: 'present',
            label: 'Present',
            visible: false
        },

        {
            key: 'absent',
            label: 'Absent',
            visible: false
        },

        {
            key: 'totalFee',
            label: 'Total Fee',
            visible: false
        },

        {
            key: 'paid',
            label: 'Paid',
            visible: true
        },

        {
            key: 'outstanding',
            label: 'Outstanding',
            visible: true
        },

        {
            key: 'feeStatus',
            label: 'Fee Status',
            visible: true
        },

        {
            key: 'status',
            label: 'Status',
            visible: true
        },

        {
            key: 'risk',
            label: 'Risk',
            visible: true
        }

    ];


    reportColumnsOpen = false;


    // =========================================================
    // DASHBOARD SEARCH
    // =========================================================

    searchTerm = '';


    // =========================================================
    // DASHBOARD FILTERS
    // =========================================================

    selectedAcademicYear = '';

    selectedClass = '';

    selectedSection = '';

    selectedStatus = 'ALL';

    selectedAttendanceFilter = 'ALL';

    selectedFeeFilter = 'ALL';

    selectedDateRange = 'ALL';


    // =========================================================
    // DASHBOARD PAGINATION
    // =========================================================

    currentPage = 1;

    pageSize = 25;

    readonly pageSizeOptions = [
        10,
        25,
        50,
        100
    ];


    // =========================================================
    // DASHBOARD COLUMNS
    // =========================================================

    showColumnMenu = false;

    columns: ColumnDefinition[] = [

        {
            key: 'student',
            label: 'Student',
            visible: true
        },

        {
            key: 'rollNumber',
            label: 'Roll No.',
            visible: true
        },

        {
            key: 'class',
            label: 'Class',
            visible: true
        },

        {
            key: 'section',
            label: 'Section',
            visible: true
        },

        {
            key: 'attendance',
            label: 'Attendance %',
            visible: true
        },

        {
            key: 'present',
            label: 'Present',
            visible: false
        },

        {
            key: 'absent',
            label: 'Absent',
            visible: false
        },

        {
            key: 'totalFee',
            label: 'Total Fee',
            visible: true
        },

        {
            key: 'paid',
            label: 'Paid',
            visible: true
        },

        {
            key: 'outstanding',
            label: 'Outstanding',
            visible: true
        },

        {
            key: 'feeStatus',
            label: 'Fee Status',
            visible: true
        },

        {
            key: 'risk',
            label: 'Risk',
            visible: true
        }

    ];


    // =========================================================
    // DASHBOARD SUMMARY
    // =========================================================

    totalStudents = 0;
    activeStudents = 0;
    newStudents = 0;
    averageAttendance = 0;
    inactiveStudents = 0;
    activeStudentPercentage = 0;

    // =========================================================
    // FEE SUMMARY
    // =========================================================

    totalFees = 0;

    totalCollected = 0;

    totalOutstanding = 0;

    paidStudents = 0;

    partiallyPaidStudents = 0;

    unpaidStudents = 0;

    feeCollectionPercentage = 0;


    // =========================================================
    // ATTENTION / RISK
    // =========================================================

    studentsNeedingAttention = 0;


    // =========================================================
    // ATTENDANCE DISTRIBUTION
    // =========================================================
    attendanceDistribution = {

        excellent: 0,

        good: 0,

        needsAttention: 0,

        noData: 0

    };


    // =========================================================
    // ATTENDANCE TRENDS
    // =========================================================

    attendanceTrends: {
        label: string;
        percentage: number;
    }[] = [];


    attendanceTrendChartData: ChartConfiguration<'line'>['data'] = {
        labels: [],
        datasets: [
            {
                label: 'Attendance %',
                data: [],
                tension: 0.35,
                fill: true,

                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.10)',

                pointBackgroundColor: '#2563eb',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2
            }
        ]
    };

    attendanceTrendChartOptions: ChartOptions<'line'> = {

        responsive: true,

        maintainAspectRatio: false,

        interaction: {
            intersect: false,
            mode: 'index'
        },

        scales: {

            y: {
                min: 0,
                max: 100,

                ticks: {
                    callback: value => `${value}%`
                },

                grid: {
                    display: true
                }
            },

            x: {
                grid: {
                    display: false
                }
            }

        },

        plugins: {

            legend: {
                display: false
            },

            tooltip: {
                callbacks: {
                    label: context =>
                        `Attendance: ${context.parsed.y}%`
                }
            }

        },

        elements: {

            line: {
                borderWidth: 3,
                tension: 0.4
            },

            point: {
                radius: 4,
                hoverRadius: 7
            }

        }

    };

    attendanceDistributionChartData: ChartConfiguration<'doughnut'>['data'] = {

        labels: [
            'Excellent',
            'Good',
            'Needs Attention',
            'No Data'
        ],

        datasets: [
            {
                data: [0, 0, 0, 0]
            }
        ]

    };

    attendanceDistributionChartOptions: ChartOptions<'doughnut'> = {

        responsive: true,

        maintainAspectRatio: false,

        cutout: '65%',

        plugins: {

            legend: {
                position: 'bottom',

                labels: {
                    padding: 18
                }
            },

            tooltip: {
                callbacks: {
                    label: context => {
                        const data =
                            context.dataset.data as number[];

                        const total =
                            data.reduce(
                                (sum, value) =>
                                    sum + Number(value),
                                0
                            );

                        const value =
                            Number(context.raw);

                        const percentage =
                            total > 0
                                ? ((value / total) * 100).toFixed(1)
                                : '0.0';

                        return `${context.label}: ${value} (${percentage}%)`;
                    }
                }
            }

        }

    };

    classDistributionChartData: ChartConfiguration<'bar'>['data'] = {

        labels: [],

        datasets: [
            {
                label: 'Students',
                data: []
            }
        ]

    };


    classDistributionChartOptions: ChartOptions<'bar'> = {

        responsive: true,

        maintainAspectRatio: false,

        scales: {

            y: {
                beginAtZero: true,

                ticks: {
                    precision: 0
                },

                grid: {
                    display: true
                }
            },

            x: {
                grid: {
                    display: false
                }
            }

        },

        plugins: {

            legend: {
                display: false
            },

            tooltip: {
                callbacks: {
                    label: context =>
                        `Students: ${context.parsed.y}`
                }
            }

        }

    };

    sectionDistributionChartData: ChartConfiguration<'bar'>['data'] = {

        labels: [],

        datasets: [
            {
                label: 'Students',
                data: []
            }
        ]

    };


    sectionDistributionChartOptions: ChartOptions<'bar'> = {

        indexAxis: 'y',

        responsive: true,

        maintainAspectRatio: false,

        scales: {

            x: {
                beginAtZero: true,

                ticks: {
                    precision: 0
                },

                grid: {
                    display: true
                }
            },

            y: {
                grid: {
                    display: false
                }
            }

        },

        plugins: {

            legend: {
                display: false
            },

            tooltip: {
                callbacks: {
                    label: context =>
                        `Students: ${context.parsed.x}`
                }
            }

        }

    };

    feeStatusChartData: ChartConfiguration<'doughnut'>['data'] = {

        labels: [
            'Fully Paid',
            'Partially Paid',
            'Unpaid'
        ],

        datasets: [
            {
                data: [0, 0, 0]
            }
        ]

    };


    feeStatusChartOptions: ChartOptions<'doughnut'> = {

        responsive: true,

        maintainAspectRatio: false,

        cutout: '60%',

        plugins: {

            legend: {
                position: 'bottom',

                labels: {
                    padding: 18
                }
            },

            tooltip: {
                callbacks: {
                    label: context => {
                        const data =
                            context.dataset.data as number[];

                        const total =
                            data.reduce(
                                (sum, value) =>
                                    sum + Number(value),
                                0
                            );

                        const value =
                            Number(context.raw);

                        const percentage =
                            total > 0
                                ? ((value / total) * 100).toFixed(1)
                                : '0.0';

                        return `${context.label}: ${value} (${percentage}%)`;
                    }
                }
            }

        }

    };


    // =========================================================
    // CROSS ANALYSIS
    // =========================================================

    lowAttendanceOutstanding = 0;

    lowAttendancePaid = 0;

    goodAttendanceOutstanding = 0;

    goodAttendancePaid = 0;


    // =========================================================
    // CLASS / SECTION DISTRIBUTION
    // =========================================================

    classDistribution: {
        name: string;
        count: number;
    }[] = [];


    sectionDistribution: {
        name: string;
        count: number;
    }[] = [];


    // =========================================================
    // FILTER OPTIONS
    // =========================================================

    academicYears: {
        id: number;
        name: string;
    }[] = [];


    classes: {
        id: number;
        name: string;
    }[] = [];

    private allClasses: {
        id: number;
        name: string;
        academicYearId: number;
    }[] = [];


    sections: {
        id: number;
        name: string;
    }[] = [];


    // =========================================================
    // LIFECYCLE
    // =========================================================

    ngOnInit(): void {

        this.loadData();


    }


    // =========================================================
    // INITIAL DATA LOAD
    // =========================================================


    private loadData(): void {

        this.loading = true;

        this.reportLoading = true;

        this.errorMessage = '';

        this.loadAcademicYears();

        this.loadClasses();

        this.studentService
            .getStudents(0, 1000)
            .subscribe({

                next: response => {

                    this.students =
                        response.data?.content ?? [];

                    this.loadAttendance();

                },

                error: error => {

                    console.error(
                        'Failed to load students',
                        error
                    );

                    this.students = [];

                    this.loading = false;

                    this.errorMessage =
                        'Unable to load student data.';

                    this.cdr.markForCheck();

                }

            });

    }

    private loadAcademicYears(): void {

        this.academicYearService
            .getAll()
            .subscribe({

                next: response => {

                    this.academicYears =
                        response.data?.content ?? [];

                    this.cdr.markForCheck();

                },

                error: error => {

                    console.error(
                        'Failed to load academic years',
                        error
                    );

                    this.academicYears = [];

                }

            });

    }

    private loadClasses(): void {

        this.classService
            .getClasses()
            .subscribe({

                next: response => {

                    this.allClasses =
                        response.data ?? [];

                    this.updateClassOptions();

                },

                error: error => {

                    console.error(
                        'Failed to load classes',
                        error
                    );

                    this.allClasses = [];

                    this.classes = [];

                }

            });

    }

    private updateClassOptions(): void {

        if (!this.selectedAcademicYear) {

            this.classes =
                this.allClasses.map(classItem => ({
                    id: classItem.id,
                    name: classItem.name
                }));

            return;

        }

        const academicYearId =
            Number(this.selectedAcademicYear);

        this.classes =
            this.allClasses

                .filter(
                    classItem =>
                        classItem.academicYearId ===
                        academicYearId
                )

                .map(classItem => ({
                    id: classItem.id,
                    name: classItem.name
                }));

    }

    private loadSections(classId: number): void {

        this.sectionService
            .getSections(classId)
            .subscribe({

                next: response => {

                    this.sections =
                        response.data ?? [];

                },

                error: error => {

                    console.error(
                        'Failed to load sections',
                        error
                    );

                    this.sections = [];

                }

            });

    }

    onAcademicYearChange(): void {

        this.selectedClass = '';

        this.selectedSection = '';

        this.sections = [];

        this.updateClassOptions();

        this.applyReportFilters();

    }

    onClassChange(): void {

        this.selectedSection = '';

        this.sections = [];

        if (!this.selectedClass) {

            this.applyReportFilters();

            return;

        }

        this.loadSections(
            Number(this.selectedClass)
        );

        this.applyReportFilters();

    }

    // =========================================================
    // LOAD ATTENDANCE
    // =========================================================

    private loadAttendance(): void {

        this.attendanceService
            .getAttendance()
            .subscribe({

                next: response => {

                    this.attendanceRecords =
                        response.data ?? [];


                    this.loadFees();

                },

                error: error => {

                    console.error(
                        'Failed to load attendance',
                        error
                    );


                    this.attendanceRecords = [];

                    this.loadFees();

                }

            });

    }


    // =========================================================
    // LOAD FEES
    // =========================================================

    private loadFees(): void {

        this.studentFeeService
            .getAll()
            .subscribe({

                next: response => {

                    this.studentFees =
                        response.data ?? [];


                    this.buildReport();

                },

                error: error => {

                    console.error(
                        'Failed to load fees',
                        error
                    );


                    this.studentFees = [];

                    this.buildReport();

                }

            });

    }


    // =========================================================
    // BUILD FILTER OPTIONS
    // ========================================================


    // =========================================================
    // BUILD COMBINED REPORT
    // =========================================================

    private buildReport(): void {

        this.reportRows =
            this.students.map(student => {

                const attendance =
                    this.calculateStudentAttendance(
                        student.id
                    );


                const fee =
                    this.calculateStudentFee(
                        student.id
                    );


                const attendancePercentage =
                    this.calculateAttendancePercentage(
                        attendance.presentCount,
                        attendance.absentCount
                    );


                const feeStatus =
                    this.calculateFeeStatus(
                        fee.totalFee,
                        fee.paidAmount
                    );


                const risk =
                    this.calculateRisk(
                        attendancePercentage,
                        fee.outstandingAmount
                    );


                return {

                    student,

                    attendancePercentage,

                    presentCount:
                        attendance.presentCount,

                    absentCount:
                        attendance.absentCount,

                    totalFee:
                        fee.totalFee,

                    paidAmount:
                        fee.paidAmount,

                    outstandingAmount:
                        fee.outstandingAmount,

                    feeStatus,

                    risk

                };

            });


        this.calculateDashboardSummary();

        this.applyReportFilters();

        this.loading = false;

        this.reportLoading = false;
        this.cdr.markForCheck();


    }


    // =========================================================
    // STUDENT ATTENDANCE
    // =========================================================

    private calculateStudentAttendance(
        studentId: number
    ): {
        presentCount: number;
        absentCount: number;
    } {

        const records =
            this.attendanceRecords.filter(
                record =>
                    record.studentId === studentId
            );


        let presentCount = 0;

        let absentCount = 0;


        for (const record of records) {

            if (
                record.status === 'PRESENT'
            ) {

                presentCount++;

            }


            if (
                record.status === 'ABSENT'
            ) {

                absentCount++;

            }

        }


        return {

            presentCount,

            absentCount

        };

    }


    // =========================================================
    // ATTENDANCE PERCENTAGE
    // =========================================================

    private calculateAttendancePercentage(
        present: number,
        absent: number
    ): number {

        const total =
            present + absent;


        if (total === 0) {

            return 0;

        }


        return Number(
            (
                (present / total) *
                100
            ).toFixed(1)
        );

    }


    // =========================================================
    // STUDENT FEE
    // =========================================================

    private calculateStudentFee(
        studentId: number
    ): {
        totalFee: number;
        paidAmount: number;
        outstandingAmount: number;
    } {

        const fees =
            this.studentFees.filter(
                fee =>
                    fee.studentId === studentId
            );


        const totalFee =
            fees.reduce(
                (sum, fee) =>
                    sum +
                    Number(
                        fee.payableAmount || 0
                    ),
                0
            );


        const paidAmount =
            fees.reduce(
                (sum, fee) =>
                    sum +
                    Number(
                        fee.paidAmount || 0
                    ),
                0
            );


        const outstandingAmount =
            Math.max(
                totalFee -
                paidAmount,
                0
            );


        return {

            totalFee,

            paidAmount,

            outstandingAmount

        };

    }


    // =========================================================
    // FEE STATUS
    // =========================================================

    private calculateFeeStatus(
        totalFee: number,
        paidAmount: number
    ):
        | 'PAID'
        | 'PARTIALLY_PAID'
        | 'UNPAID' {

        if (totalFee <= 0) {

            return 'UNPAID';

        }


        if (paidAmount >= totalFee) {

            return 'PAID';

        }


        if (paidAmount > 0) {

            return 'PARTIALLY_PAID';

        }


        return 'UNPAID';

    }


    // =========================================================
    // RISK
    // =========================================================

    private calculateRisk(
        attendancePercentage: number,
        outstandingAmount: number
    ):
        | 'LOW'
        | 'MEDIUM'
        | 'HIGH' {

        const lowAttendance =
            attendancePercentage > 0 &&
            attendancePercentage < 75;


        const hasOutstanding =
            outstandingAmount > 0;


        if (
            lowAttendance &&
            hasOutstanding
        ) {

            return 'HIGH';

        }


        if (
            lowAttendance ||
            hasOutstanding
        ) {

            return 'MEDIUM';

        }


        return 'LOW';

    }


    // =========================================================
    // DASHBOARD SUMMARY
    // =========================================================

    private calculateDashboardSummary(): void {

        this.totalStudents =
            this.reportRows.length;


        this.activeStudents =
            this.reportRows.filter(
                row =>
                    row.student.isActive
            ).length;

        this.inactiveStudents =
            this.totalStudents -
            this.activeStudents;

        this.activeStudentPercentage =
            this.totalStudents === 0
                ? 0
                : Number(
                    (
                        (this.activeStudents /
                            this.totalStudents) *
                        100
                    ).toFixed(1)
                );


        // -----------------------------------------------------
        // NEW STUDENTS
        // -----------------------------------------------------
        //
        // New-student calculation is intentionally kept at zero
        // until the actual enrollment/creation-date requirement
        // is connected to the available backend data.
        //

        this.newStudents = 0;


        // -----------------------------------------------------
        // ATTENDANCE DISTRIBUTION
        // -----------------------------------------------------

        this.attendanceDistribution = {

            excellent: 0,

            good: 0,

            needsAttention: 0,

            noData: 0

        };


        const attendanceValues: number[] = [];

        this.attendanceTrends = [];

        const attendanceByDate = new Map<
            string,
            { present: number; total: number }
        >();

        for (const record of this.attendanceRecords) {

            const date = record.attendanceDate;

            if (!attendanceByDate.has(date)) {
                attendanceByDate.set(date, {
                    present: 0,
                    total: 0
                });
            }

            const data = attendanceByDate.get(date)!;

            data.total++;

            if (record.status === 'PRESENT') {
                data.present++;
            }

        }

        const sortedDates =
            Array.from(attendanceByDate.keys())
                .sort()
                .slice(-7);

        for (const date of sortedDates) {

            const data = attendanceByDate.get(date)!;

            const percentage =
                data.total > 0
                    ? Number(
                        ((data.present / data.total) * 100)
                            .toFixed(1)
                    )
                    : 0;

            this.attendanceTrends.push({
                label: new Date(date + 'T00:00:00').toLocaleDateString(
                    'en-IN',
                    {
                        day: '2-digit',
                        month: 'short'
                    }
                ),
                percentage
            });

        }

        this.attendanceTrendChartData = {
            labels: this.attendanceTrends.map(
                trend => trend.label
            ),
            datasets: [
                {
                    label: 'Attendance %',
                    data: this.attendanceTrends.map(
                        trend => trend.percentage
                    ),
                    tension: 0.35,
                    fill: true,

                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.10)',

                    pointBackgroundColor: '#2563eb',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2
                }
            ]
        };


        // Update chart AFTER all trend data is prepared




        for (const row of this.reportRows) {

            if (
                row.attendancePercentage >= 90
            ) {

                this.attendanceDistribution.excellent++;

            } else if (
                row.attendancePercentage >= 75
            ) {

                this.attendanceDistribution.good++;

            } else if (
                row.attendancePercentage > 0
            ) {

                this.attendanceDistribution.needsAttention++;

            } else {

                this.attendanceDistribution.noData++;

            }


            if (
                row.attendancePercentage > 0
            ) {

                attendanceValues.push(
                    row.attendancePercentage
                );

            }

        }

        this.attendanceDistributionChartData = {
            labels: [
                'Excellent',
                'Good',
                'Needs Attention',
                'No Data'
            ],
            datasets: [
                {
                    data: [
                        this.attendanceDistribution.excellent,
                        this.attendanceDistribution.good,
                        this.attendanceDistribution.needsAttention,
                        this.attendanceDistribution.noData
                    ],

                    backgroundColor: [
                        '#16a34a',
                        '#2563eb',
                        '#f59e0b',
                        '#94a3b8'
                    ],

                    borderColor: '#ffffff',
                    borderWidth: 2
                }
            ]
        };


        // -----------------------------------------------------
        // AVERAGE ATTENDANCE
        // -----------------------------------------------------

        if (
            attendanceValues.length > 0
        ) {

            this.averageAttendance =
                Number(
                    (
                        attendanceValues.reduce(
                            (sum, value) =>
                                sum + value,
                            0
                        ) /
                        attendanceValues.length
                    ).toFixed(1)
                );

        } else {

            this.averageAttendance = 0;

        }


        // -----------------------------------------------------
        // FEES
        // -----------------------------------------------------

        this.totalFees =
            this.reportRows.reduce(
                (sum, row) =>
                    sum + row.totalFee,
                0
            );


        this.totalCollected =
            this.reportRows.reduce(
                (sum, row) =>
                    sum + row.paidAmount,
                0
            );


        this.totalOutstanding =
            this.reportRows.reduce(
                (sum, row) =>
                    sum + row.outstandingAmount,
                0
            );


        this.paidStudents =
            this.reportRows.filter(
                row =>
                    row.feeStatus === 'PAID'
            ).length;


        this.partiallyPaidStudents =
            this.reportRows.filter(
                row =>
                    row.feeStatus === 'PARTIALLY_PAID'
            ).length;


        this.unpaidStudents =
            this.reportRows.filter(
                row =>
                    row.feeStatus === 'UNPAID'
            ).length;

        this.feeStatusChartData = {

            labels: [
                'Fully Paid',
                'Partially Paid',
                'Unpaid'
            ],

            datasets: [
                {
                    data: [
                        this.paidStudents,
                        this.partiallyPaidStudents,
                        this.unpaidStudents
                    ]
                }
            ]

        };


        // -----------------------------------------------------
        // FEE COLLECTION %
        // -----------------------------------------------------

        if (this.totalFees > 0) {

            this.feeCollectionPercentage =
                Number(
                    (
                        (
                            this.totalCollected /
                            this.totalFees
                        ) *
                        100
                    ).toFixed(1)
                );

        } else {

            this.feeCollectionPercentage = 0;

        }


        // -----------------------------------------------------
        // RISK
        // -----------------------------------------------------

        this.studentsNeedingAttention =
            this.reportRows.filter(
                row =>
                    row.risk !== 'LOW'
            ).length;


        // -----------------------------------------------------
        // CROSS ANALYSIS
        // -----------------------------------------------------

        this.lowAttendanceOutstanding = 0;

        this.lowAttendancePaid = 0;

        this.goodAttendanceOutstanding = 0;

        this.goodAttendancePaid = 0;


        for (const row of this.reportRows) {

            const lowAttendance =
                row.attendancePercentage > 0 &&
                row.attendancePercentage < 75;


            const goodAttendance =
                row.attendancePercentage >= 75;


            const hasOutstanding =
                row.outstandingAmount > 0;


            if (
                lowAttendance &&
                hasOutstanding
            ) {

                this.lowAttendanceOutstanding++;

            }


            if (
                lowAttendance &&
                !hasOutstanding
            ) {

                this.lowAttendancePaid++;

            }


            if (
                goodAttendance &&
                hasOutstanding
            ) {

                this.goodAttendanceOutstanding++;

            }


            if (
                goodAttendance &&
                !hasOutstanding
            ) {

                this.goodAttendancePaid++;

            }

        }


        // -----------------------------------------------------
        // CLASS DISTRIBUTION
        // -----------------------------------------------------

        const classMap =
            new Map<string, number>();


        for (const row of this.reportRows) {

            const className =
                row.student.className ||
                'Unknown';


            classMap.set(
                className,
                (
                    classMap.get(className) ??
                    0
                ) + 1
            );

        }


        this.classDistribution =
            Array.from(
                classMap.entries()
            )
                .map(([name, count]) => ({
                    name,
                    count
                }))
                .sort(
                    (a, b) =>
                        a.name.localeCompare(
                            b.name
                        )
                );


        this.classDistributionChartData = {

            labels: this.classDistribution.map(
                item => item.name
            ),

            datasets: [
                {
                    label: 'Students',

                    data: this.classDistribution.map(
                        item => item.count
                    )
                }
            ]

        };

        // -----------------------------------------------------
        // SECTION DISTRIBUTION
        // -----------------------------------------------------

        const sectionMap =
            new Map<string, number>();


        for (const row of this.reportRows) {

            const sectionName =
                row.student.sectionName ||
                'Unknown';


            sectionMap.set(
                sectionName,
                (
                    sectionMap.get(sectionName) ??
                    0
                ) + 1
            );

        }


        this.sectionDistribution =
            Array.from(
                sectionMap.entries()
            )
                .map(([name, count]) => ({
                    name,
                    count
                }))
                .sort(
                    (a, b) =>
                        a.name.localeCompare(
                            b.name
                        )
                );

        this.sectionDistributionChartData = {
            labels: this.sectionDistribution.map(
                item => item.name
            ),
            datasets: [
                {
                    label: 'Students',
                    data: this.sectionDistribution.map(
                        item => item.count
                    )
                }
            ]
        };

    }




    // =========================================================
    // DASHBOARD FILTERING
    // =========================================================

    applyFilters(): void {

        const search =
            this.searchTerm
                .trim()
                .toLowerCase();


        this.filteredRows =
            this.reportRows.filter(row => {

                const student =
                    row.student;


                // ------------------------------------------------
                // SEARCH
                // ------------------------------------------------

                const studentName =
                    this.getStudentName(
                        student
                    ).toLowerCase();


                const matchesSearch =
                    !search ||

                    studentName.includes(
                        search
                    ) ||

                    (
                        student.rollNumber
                            ?.toLowerCase()
                            .includes(search)
                        ?? false
                    ) ||

                    (
                        student.email
                            ?.toLowerCase()
                            .includes(search)
                        ?? false
                    );


                if (!matchesSearch) {

                    return false;

                }


                // ------------------------------------------------
                // ACADEMIC YEAR
                // ------------------------------------------------

                const matchesAcademicYear =
                    !this.selectedAcademicYear ||

                    student.academicYearId ===
                    Number(
                        this.selectedAcademicYear
                    );


                if (!matchesAcademicYear) {

                    return false;

                }


                // ------------------------------------------------
                // CLASS
                // ------------------------------------------------

                const matchesClass =
                    !this.selectedClass ||

                    student.classId ===
                    Number(
                        this.selectedClass
                    );


                if (!matchesClass) {

                    return false;

                }


                // ------------------------------------------------
                // SECTION
                // ------------------------------------------------

                const matchesSection =
                    !this.selectedSection ||

                    student.sectionId ===
                    Number(
                        this.selectedSection
                    );


                if (!matchesSection) {

                    return false;

                }


                // ------------------------------------------------
                // STATUS
                // ------------------------------------------------

                const matchesStatus =
                    this.selectedStatus ===
                    'ALL' ||

                    (
                        this.selectedStatus ===
                        'ACTIVE' &&
                        student.isActive
                    ) ||

                    (
                        this.selectedStatus ===
                        'INACTIVE' &&
                        !student.isActive
                    );


                if (!matchesStatus) {

                    return false;

                }


                // ------------------------------------------------
                // ATTENDANCE
                // ------------------------------------------------

                if (
                    !this.matchesAttendanceFilter(
                        row.attendancePercentage
                    )
                ) {

                    return false;

                }


                // ------------------------------------------------
                // FEE
                // ------------------------------------------------

                if (
                    !this.matchesFeeFilter(
                        row.feeStatus
                    )
                ) {

                    return false;

                }


                return true;

            });


        this.currentPage = 1;

        this.updatePagination();

    }


    // =========================================================
    // ATTENDANCE FILTER
    // =========================================================

    private matchesAttendanceFilter(
        percentage: number
    ): boolean {

        switch (
        this.selectedAttendanceFilter
        ) {

            case 'EXCELLENT':

                return percentage >= 90;


            case 'GOOD':

                return (
                    percentage >= 75 &&
                    percentage < 90
                );


            case 'LOW':

                return (
                    percentage > 0 &&
                    percentage < 75
                );


            case 'NO_DATA':

                return percentage === 0;


            default:

                return true;

        }

    }


    // =========================================================
    // FEE FILTER
    // =========================================================

    private matchesFeeFilter(
        status:
            | 'PAID'
            | 'PARTIALLY_PAID'
            | 'UNPAID'
    ): boolean {

        switch (
        this.selectedFeeFilter
        ) {

            case 'PAID':

                return status === 'PAID';


            case 'PARTIALLY_PAID':

                return (
                    status ===
                    'PARTIALLY_PAID'
                );


            case 'UNPAID':

                return status === 'UNPAID';


            default:

                return true;

        }

    }


    // =========================================================
    // RESET DASHBOARD FILTERS
    // =========================================================

    resetFilters(): void {

        this.searchTerm = '';

        this.selectedAcademicYear = '';

        this.selectedClass = '';

        this.selectedSection = '';

        this.selectedStatus = 'ALL';

        this.selectedAttendanceFilter =
            'ALL';

        this.selectedFeeFilter =
            'ALL';

        this.selectedDateRange =
            'ALL';

        this.applyReportFilters();

    }

    // =========================================================
    // DASHBOARD PAGINATION
    // =========================================================

    updatePagination(): void {

        const startIndex =
            (
                this.currentPage - 1
            ) *
            this.pageSize;


        const endIndex =
            startIndex +
            this.pageSize;


        this.paginatedRows =
            this.filteredRows.slice(
                startIndex,
                endIndex
            );

    }


    get totalPages(): number {

        if (
            this.filteredRows.length === 0
        ) {

            return 1;

        }


        return Math.ceil(
            this.filteredRows.length /
            this.pageSize
        );

    }


    get startRecord(): number {

        if (
            this.filteredRows.length === 0
        ) {

            return 0;

        }


        return (
            (
                this.currentPage - 1
            ) *
            this.pageSize
        ) + 1;

    }


    get endRecord(): number {

        return Math.min(
            this.currentPage *
            this.pageSize,
            this.filteredRows.length
        );

    }


    changePage(
        page: number
    ): void {

        if (
            page < 1 ||
            page > this.totalPages
        ) {

            return;

        }


        this.currentPage = page;

        this.updatePagination();

    }


    nextPage(): void {

        this.changePage(
            this.currentPage + 1
        );

    }


    previousPage(): void {

        this.changePage(
            this.currentPage - 1
        );

    }


    changePageSize(): void {

        this.currentPage = 1;

        this.updatePagination();

    }


    get paginationPages(): number[] {

        const pages: number[] = [];


        for (
            let page = 1;
            page <= this.totalPages;
            page++
        ) {

            pages.push(page);

        }


        return pages;

    }


    // =========================================================
    // DASHBOARD COLUMN CUSTOMIZATION
    // =========================================================

    toggleColumnMenu(): void {

        this.showColumnMenu =
            !this.showColumnMenu;

    }


    isColumnVisible(
        key: string
    ): boolean {

        return this.columns.some(
            column =>
                column.key === key &&
                column.visible
        );

    }


    toggleColumn(
        key: string
    ): void {

        const column =
            this.columns.find(
                item =>
                    item.key === key
            );


        if (!column) {

            return;

        }


        column.visible =
            !column.visible;

    }


    // =========================================================
    // DISPLAY HELPERS
    // =========================================================

    getStudentName(
        student: Student
    ): string {

        return (
            `${student.firstName} ${student.lastName}`
        ).trim();

    }


    getAttendanceClass(
        percentage: number
    ): string {

        if (percentage >= 90) {

            return 'excellent';

        }


        if (percentage >= 75) {

            return 'good';

        }


        if (percentage > 0) {

            return 'low';

        }


        return 'no-data';

    }


    getRiskLabel(
        risk:
            | 'LOW'
            | 'MEDIUM'
            | 'HIGH'
    ): string {

        switch (risk) {

            case 'HIGH':

                return 'High';


            case 'MEDIUM':

                return 'Medium';


            default:

                return 'Low';

        }

    }


    getFeeStatusLabel(
        status:
            | 'PAID'
            | 'PARTIALLY_PAID'
            | 'UNPAID'
    ): string {

        switch (status) {

            case 'PAID':

                return 'Paid';


            case 'PARTIALLY_PAID':

                return 'Partially Paid';


            default:

                return 'Unpaid';

        }

    }


    // =========================================================
    // STUDENT REPORT
    // =========================================================
    //
    // IMPORTANT:
    // The report uses the already-loaded combined student data.
    // We do NOT maintain a second independent data-loading
    // implementation here.
    //
    // =========================================================

    loadStudentReport(): void {

        this.reportLoading = true;


        this.reportStudents =
            this.students;


        this.reportAttendance =
            this.attendanceRecords;


        this.reportFees =
            this.studentFees;


        this.reportRows =
            this.students.map(student => {

                const attendance =
                    this.calculateStudentAttendanceForReport(
                        student.id
                    );


                const fee =
                    this.calculateStudentFeeForReport(
                        student.id
                    );


                const attendancePercentage =
                    this.calculateAttendancePercentage(
                        attendance.present,
                        attendance.absent
                    );


                const feeStatus =
                    this.calculateFeeStatus(
                        fee.totalFee,
                        fee.paidAmount
                    );


                const risk =
                    this.calculateRisk(
                        attendancePercentage,
                        fee.outstandingAmount
                    );


                return {

                    student,

                    attendancePercentage,

                    presentCount:
                        attendance.present,

                    absentCount:
                        attendance.absent,

                    totalFee:
                        fee.totalFee,

                    paidAmount:
                        fee.paidAmount,

                    outstandingAmount:
                        fee.outstandingAmount,

                    feeStatus,

                    risk

                };

            });


        this.applyReportFilters();

        this.reportLoading = false;

    }


    // =========================================================
    // REPORT ATTENDANCE
    // =========================================================

    private calculateStudentAttendanceForReport(
        studentId: number
    ): {
        present: number;
        absent: number;
    } {

        const records =
            this.reportAttendance.filter(
                record =>
                    record.studentId === studentId
            );


        const present =
            records.filter(
                record =>
                    record.status === 'PRESENT'
            ).length;


        const absent =
            records.filter(
                record =>
                    record.status === 'ABSENT'
            ).length;


        return {

            present,

            absent

        };

    }


    // =========================================================
    // REPORT FEE
    // =========================================================

    private calculateStudentFeeForReport(
        studentId: number
    ): {
        totalFee: number;
        paidAmount: number;
        outstandingAmount: number;
    } {

        const fees =
            this.reportFees.filter(
                fee =>
                    fee.studentId === studentId
            );


        const totalFee =
            fees.reduce(
                (sum, fee) =>
                    sum +
                    Number(
                        fee.payableAmount || 0
                    ),
                0
            );


        const paidAmount =
            fees.reduce(
                (sum, fee) =>
                    sum +
                    Number(
                        fee.paidAmount || 0
                    ),
                0
            );


        return {

            totalFee,

            paidAmount,

            outstandingAmount:
                Math.max(
                    totalFee -
                    paidAmount,
                    0
                )

        };

    }


    // =========================================================
    // REPORT FILTERING
    // =========================================================

    private applyReportFilters(): void {

        const search =
            this.reportSearch
                .trim()
                .toLowerCase();


 this.reportFilteredRows =
    this.reportRows.filter(row => {

                const student =
                    row.student;


                const studentName =
                    this.getStudentName(
                        student
                    ).toLowerCase();


                const matchesSearch =
                    !search ||

                    studentName.includes(
                        search
                    ) ||

                    (
                        student.rollNumber
                            ?.toLowerCase()
                            .includes(search)
                        ?? false
                    ) ||

                    (
                        student.email
                            ?.toLowerCase()
                            .includes(search)
                        ?? false
                    );


                if (!matchesSearch) {

                    return false;

                }


                const matchesAcademicYear =
                    this.reportAcademicYearId ===
                    null ||

                    student.academicYearId ===
                    this.reportAcademicYearId;


                if (!matchesAcademicYear) {

                    return false;

                }


                const matchesClass =
                    this.reportClassId === null ||

                    student.classId ===
                    this.reportClassId;


                if (!matchesClass) {

                    return false;

                }


                const matchesSection =
                    this.reportSectionId === null ||

                    student.sectionId ===
                    this.reportSectionId;


                if (!matchesSection) {

                    return false;

                }


                const matchesStatus =
                    this.reportStudentStatus ===
                    'ALL' ||

                    (
                        this.reportStudentStatus ===
                        'ACTIVE' &&
                        student.isActive
                    ) ||

                    (
                        this.reportStudentStatus ===
                        'INACTIVE' &&
                        !student.isActive
                    );


                if (!matchesStatus) {

                    return false;

                }


                if (
                    !this.matchesReportAttendanceFilter(
                        row.attendancePercentage
                    )
                ) {

                    return false;

                }


                if (
                    !this.matchesReportFeeFilter(
                        row.feeStatus
                    )
                ) {

                    return false;

                }


                return true;

            });


        this.updateReportPagination();

    }


    // =========================================================
    // REPORT ATTENDANCE FILTER
    // =========================================================

    private matchesReportAttendanceFilter(
        percentage: number
    ): boolean {

        switch (this.reportAttendanceFilter) {

            case 'EXCELLENT':
                return percentage >= 90;

            case 'GOOD':
                return (
                    percentage >= 75 &&
                    percentage < 90
                );

            case 'NEEDS_ATTENTION':
                return (
                    percentage > 0 &&
                    percentage < 75
                );

            case 'CRITICAL':
                return (
                    percentage > 0 &&
                    percentage < 50
                );

            case 'LOW':
                return (
                    percentage > 0 &&
                    percentage < 75
                );

            case 'NO_DATA':
                return percentage === 0;

            case 'ALL':
            default:
                return true;
        }

    }
    // =========================================================
    // REPORT FEE FILTER
    // =========================================================

    private matchesReportFeeFilter(
        status:
            | 'PAID'
            | 'PARTIALLY_PAID'
            | 'UNPAID'
    ): boolean {

        switch (this.reportFeeFilter) {

            case 'PAID':
                return status === 'PAID';

            case 'REMAINING':
                return (
                    status === 'PARTIALLY_PAID' ||
                    status === 'UNPAID'
                );

            case 'UNPAID':
                return status === 'UNPAID';

            case 'ALL':
            default:
                return true;
        }

    }

    // =========================================================
    // REPORT SEARCH
    // =========================================================

    onReportSearch(): void {

        this.reportPage = 0;

        this.applyReportFilters();

    }


    // =========================================================
    // REPORT FILTER CHANGE
    // =========================================================

    onReportFilterChange(): void {

        this.reportPage = 0;

        this.applyReportFilters();

    }


    // =========================================================
    // REPORT RESET
    // =========================================================

    resetReportFilters(): void {

        this.reportSearch = '';

        this.reportAcademicYearId =
            null;

        this.reportClassId =
            null;

        this.reportSectionId =
            null;

        this.reportStudentStatus =
            'ALL';

        this.reportAttendanceFilter =
            'ALL';

        this.reportFeeFilter =
            'ALL';

        this.reportPage = 0;

        this.applyReportFilters();

    }


    // =========================================================
    // REPORT PAGINATION
    // =========================================================

    private updateReportPagination(): void {

this.reportTotalElements =
    this.reportFilteredRows.length;


        this.reportTotalPages =
            Math.max(
                1,
Math.ceil(
    this.reportFilteredRows.length /
    this.reportPageSize
)
            );


        if (
            this.reportPage >=
            this.reportTotalPages
        ) {

            this.reportPage =
                this.reportTotalPages - 1;

        }


        const startIndex =
            this.reportPage *
            this.reportPageSize;


        const endIndex =
            startIndex +
            this.reportPageSize;


this.reportPaginatedRows =
    this.reportFilteredRows.slice(
                startIndex,
                endIndex
            );

    }


    // =========================================================
    // REPORT PAGE
    // =========================================================

    goToReportPage(
        page: number
    ): void {

        if (
            page < 0 ||
            page >= this.reportTotalPages
        ) {

            return;

        }


        if (
            page === this.reportPage
        ) {

            return;

        }


        this.reportPage = page;

        this.updateReportPagination();

    }


    nextReportPage(): void {

        if (
            this.reportPage <
            this.reportTotalPages - 1
        ) {

            this.reportPage++;

            this.updateReportPagination();

        }

    }


    previousReportPage(): void {

        if (
            this.reportPage > 0
        ) {

            this.reportPage--;

            this.updateReportPagination();

        }

    }


    // =========================================================
    // REPORT COLUMN CUSTOMIZATION
    // =========================================================

    toggleReportColumns(): void {

        this.reportColumnsOpen =
            !this.reportColumnsOpen;

    }


    isReportColumnVisible(
        key: string
    ): boolean {

        return this.reportColumns.some(
            column =>
                column.key === key &&
                column.visible
        );

    }


    toggleReportColumn(
        key: string
    ): void {

        const column =
            this.reportColumns.find(
                item =>
                    item.key === key
            );


        if (!column) {

            return;

        }


        column.visible =
            !column.visible;

    }


    // =========================================================
    // REPORT STUDENT ATTENDANCE
    // =========================================================

    getStudentAttendance(
        studentId: number
    ): {
        percentage: number;
        present: number;
        absent: number;
    } {

        const records =
            this.reportAttendance.filter(
                record =>
                    record.studentId ===
                    studentId
            );


        const present =
            records.filter(
                record =>
                    record.status ===
                    'PRESENT'
            ).length;


        const absent =
            records.filter(
                record =>
                    record.status ===
                    'ABSENT'
            ).length;


        const total =
            present + absent;


        const percentage =
            total === 0
                ? 0
                : Number(
                    (
                        (present / total) *
                        100
                    ).toFixed(1)
                );


        return {

            percentage,

            present,

            absent

        };

    }


    // =========================================================
    // REPORT STUDENT FEE
    // =========================================================

    getStudentFee(
        studentId: number
    ): StudentFee | null {

        return (
            this.reportFees.find(
                fee =>
                    fee.studentId ===
                    studentId
            ) ?? null
        );

    }


    // =========================================================
    // REPORT STUDENT RISK
    // =========================================================

    getStudentRisk(
        studentId: number
    ): string {

        const attendance =
            this.getStudentAttendance(
                studentId
            );


        const fee =
            this.getStudentFee(
                studentId
            );


        const lowAttendance =
            attendance.percentage > 0 &&
            attendance.percentage < 75;


        const outstandingFees =
            !!fee &&
            fee.remainingAmount > 0;


        if (
            lowAttendance &&
            outstandingFees
        ) {

            return 'HIGH';

        }


        if (
            lowAttendance ||
            outstandingFees
        ) {

            return 'MEDIUM';

        }


        return 'LOW';

    }


    // =========================================================
    // REPORT STUDENT FEE STATUS
    // =========================================================

    getStudentFeeStatus(
        studentId: number
    ): string {

        const fee =
            this.getStudentFee(
                studentId
            );


        if (!fee) {

            return 'N/A';

        }


        return fee.status;

    }

    getReportEndRecord(): number {

        return Math.min(
            (this.reportPage + 1) * this.reportPageSize,
            this.reportTotalElements
        );
    }

}