import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject,
  HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { StudentImportComponent } from '../student-import/student-import';
import { ConfirmationDialogComponent } from '../../../../shared/components/confirmation-dialog/confirmation-dialog.component';

import {
  DataTableComponent,
  TableColumn,
  TableAction
} from '../../../../shared/components/data-table/data-table.component';

import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { SearchInputComponent } from '../../../../shared/components/search-input/search-input.component';
import { StudentQuickViewComponent } from '../../../../shared/components/student-quick-view/student-quick-view.component';

import { Student } from '../models/student.model';
import {
  BulkUpdateStudentRequest,
  StudentService
} from '../services/student.service';

import { AcademicYearService } from '../../academic/academic-years/services/academic-year.service';
import { AcademicYear } from '../../academic/academic-years/academic-year.model';

import { ClassService } from '../../academic/classes/class.service';
import { AcademicClass } from '../../academic/classes/class.model';

import { SectionService } from '../../academic/classes/section.service';
import { Section } from '../../academic/classes/section.model';

import { School } from '../../academic/schools/school.model';
import { SchoolService } from '../../academic/schools/services/school.service';

import { Branch } from '../../academic/branches/branch.model';
import { BranchService } from '../../academic/branches/services/branch.service';

import { BoardMedium } from '../../academic/board-media/board-medium.model';
import { BoardMediumService } from '../../academic/board-media/services/board-medium.service';

import { AttendanceService } from '../../attendance/services/attendance.service';
import { Attendance } from '../../attendance/models/attendance.model';

import { StudentFeeService } from '../../fees/services/student-fee.service';
import { StudentFee } from '../../fees/models/student-fee.model';

import { StudentForm } from '../student-form/student-form';

import {
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';

interface StudentListRow extends Student {
  enrollmentNumber: string;
  schoolName: string | null;
  originalFee: number;
  discountAmount: number;
  payableAmount: number;
  paidAmount: number;
  remainingAmount: number;
  feeStatus: string;

  attendancePercentage: number;
}

@Component({
  selector: 'app-student-list',
  standalone: true,
imports: [
  CommonModule,
  FormsModule,
  DataTableComponent,
  PaginationComponent,
  SearchInputComponent,
  ConfirmationDialogComponent,
  StudentQuickViewComponent,
  StudentForm,
  StudentImportComponent
],
  templateUrl: './student-list.html',
  styleUrl: './student-list.scss'
})
export class StudentList implements OnInit {

  readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private readonly studentService = inject(StudentService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly academicYearService = inject(AcademicYearService);
  private readonly classService = inject(ClassService);
  private readonly sectionService = inject(SectionService);
  private readonly schoolService = inject(SchoolService);
  private readonly branchService = inject(BranchService);
  private readonly boardMediumService = inject(BoardMediumService);
  private readonly attendanceService = inject(AttendanceService);
  private readonly studentFeeService = inject(StudentFeeService);

  editStudentId: number | null = null;
  editPopupOpen = false;
  addPopupOpen = false;
  importPopupOpen = false;

  bulkEditOpen = false;
bulkEditStep: 'edit' | 'preview' = 'edit';

bulkUpdating = false;

bulkSelectedFields = new Set<string>();

bulkFirstName = '';
bulkLastName = '';
bulkPhone = '';
bulkGender: 'Male' | 'Female' | null = null;

bulkSchoolId: number | null = null;
bulkBranchId: number | null = null;
bulkBoardMediumId: number | null = null;

bulkAcademicYearId: number | null = null;
bulkClassId: number | null = null;
bulkSectionId: number | null = null;

bulkFilteredClasses: AcademicClass[] = [];
bulkSections: Section[] = [];

schools: School[] = [];
branches: Branch[] = [];
boardMedia: BoardMedium[] = [];


bulkEditableFields = [
  {
    key: 'firstName',
    label: 'First Name'
  },
  {
    key: 'lastName',
    label: 'Last Name'
  },
  {
    key: 'phone',
    label: 'Phone'
  },
  {
    key: 'gender',
    label: 'Gender'
  },
  {
    key: 'schoolId',
    label: 'School'
  },
  {
    key: 'branchId',
    label: 'Branch'
  },
  {
    key: 'boardMediumId',
    label: 'Board Medium'
  },
  {
    key: 'academicYearId',
    label: 'Academic Year'
  },
  {
    key: 'classId',
    label: 'Class'
  },
  {
    key: 'sectionId',
    label: 'Section'
  }
];

  students: StudentListRow[] = [];

  selectedStudentIds: number[] = [];
  bulkSelectionMode = false;

  loading = false;
  errorMessage = '';
  successMessage = '';

  search = '';

  // =========================================================
  // VIEW
  // =========================================================

  viewMode: 'table' | 'cards' = 'table';

  exportMenuOpen = false;
  exporting = false;

  // =========================================================
  // FILTERS
  // =========================================================

  academicYears: AcademicYear[] = [];
  classes: AcademicClass[] = [];
  sections: Section[] = [];

  selectedAcademicYearId: number | null = null;
  selectedClassId: number | null = null;
  selectedSectionId: number | null = null;

  // =========================================================
  // PAGINATION
  // =========================================================

  page = 0;
  size = 50;
  totalElements = 0;
  sortBy: string | null = null;
  sortDirection: 'asc' | 'desc' | null = null;

  // =========================================================
  // CONFIRMATION DIALOG
  // =========================================================

  showConfirmationDialog = false;

  confirmationTitle = '';
  confirmationMessage = '';
  confirmationConfirmLabel = 'Confirm';

  pendingStudent: Student | null = null;
  pendingAction: 'status' | 'delete' | null = null;
  pendingNewStatus: boolean | null = null;

  // =========================================================
  // STUDENT QUICK VIEW
  // =========================================================

  quickViewStudentId: number | null = null;

  // =========================================================
  // TABLE COLUMNS
  // =========================================================

  columns: TableColumn[] = [
    {
      key: 'studentName',
      label: 'Name',
      width: '240px',
      type: 'student-name',
      sortable: true,
      value: (row: StudentListRow) =>
        `${row.firstName ?? ''} ${row.lastName ?? ''}`.trim()
    },
    {
      key: 'rollNumber',
      label: 'Roll No.',
      width: '120px',
      sortable: true
    },
    {
      key: 'schoolName',
      label: 'School',
      width: '180px',
      type: 'text',
      sortable: true
    },
    {
      key: 'academicYearName',
      label: 'Academic Year',
      width: '150px',
      sortable: true
    },
    {
      key: 'className',
      label: 'Class',
      width: '120px',
      sortable: true
    },
    {
      key: 'sectionName',
      label: 'Section',
      width: '120px',
      sortable: true
    },
    {
      key: 'gender',
      label: 'Gender',
      width: '110px',
      sortable: true
    },
    {
      key: 'boardMediumName',
      label: 'Board-Medium',
      width: '160px',
      sortable: true
    },
    {
      key: 'branchName',
      label: 'Branch',
      width: '140px',
      sortable: true
    },
    {
      key: 'isActive',
      label: 'Status',
      width: '110px',
      type: 'status',
      sortable: true
    },
    {
      key: 'email',
      label: 'Email',
      width: '220px',
      sortable: true
    },
    {
      key: 'phone',
      label: 'Phone',
      width: '140px',
      sortable: true
    },
    {
      key: 'originalFee',
      label: 'Original Fee (₹)',
      width: '140px',
      align: 'right',
      sortable: true,
      value: (row: StudentListRow) =>
        this.formatCurrency(row.originalFee)
    },
    {
      key: 'discountAmount',
      label: 'Discount (₹)',
      width: '130px',
      align: 'right',
      sortable: true,
      value: (row: StudentListRow) =>
        this.formatCurrency(row.discountAmount)
    },
    {
      key: 'payableAmount',
      label: 'Payable (₹)',
      width: '130px',
      align: 'right',
      sortable: true,
      value: (row: StudentListRow) =>
        this.formatCurrency(row.paidAmount)
    },
    {
      key: 'remainingAmount',
      label: 'Remaining (₹)',
      width: '140px',
      align: 'right',
      value: (row: StudentListRow) =>
        this.formatCurrency(row.remainingAmount)
    },
    {
      key: 'feeStatus',
      label: 'Fee Status',
      width: '140px',
      type: 'fee-status'
    },
    {
      key: 'attendancePercentage',
      label: 'Attendance %',
      width: '130px',
      align: 'right',
      value: (row: StudentListRow) =>
        `${row.attendancePercentage}%`
    },
  ];

  // =========================================================
  // COLUMN CUSTOMIZATION
  // =========================================================

  visibleColumnKeys: string[] = [
    'studentName',
    'rollNumber',
    'schoolName',
    'academicYearName',
    'className',
    'sectionName',
    'gender',
    'boardMediumName',
    'branchName',
    'isActive',
    'email',
    'phone',
    'originalFee',
    'discountAmount',
    'payableAmount',
    'paidAmount',
    'remainingAmount',
    'feeStatus',
    'attendancePercentage'
  ];

  columnMenuOpen = false;

  get visibleColumns(): TableColumn[] {
    return this.columns.filter(column =>
      this.visibleColumnKeys.includes(column.key)
    );
  }

  isColumnVisible(key: string): boolean {
    return this.visibleColumnKeys.includes(key);
  }

  toggleColumn(key: string): void {
    // Name must always remain visible.
    if (key === 'studentName') {
      return;
    }

    if (this.visibleColumnKeys.includes(key)) {
      this.visibleColumnKeys =
        this.visibleColumnKeys.filter(item => item !== key);
    } else {
      this.visibleColumnKeys = [
        ...this.visibleColumnKeys,
        key
      ];
    }
  }

  toggleColumnMenu(): void {
    this.columnMenuOpen = !this.columnMenuOpen;
  }

  closeColumnMenu(): void {
    this.columnMenuOpen = false;
  }

  resetColumns(): void {
    this.visibleColumnKeys = this.columns.map(
      column => column.key
    );
  }

  // =========================================================
  // ACTIONS
  // =========================================================

  actions: TableAction[] = [
    {
      label: 'View',
      type: 'view'
    },
    {
      label: 'Edit',
      type: 'edit'
    },
    {
      label: 'Status',
      type: 'status'
    },
    {
      label: 'Delete',
      type: 'delete',
      danger: true
    }
  ];

  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {
    this.loadAcademicYears();
    this.loadClasses();
    this.loadStudents();

    this.route.queryParams.subscribe(params => {
      if (params['created'] === 'true') {
        this.page = 0;
        this.loadStudents();

        this.router.navigate([], {
          queryParams: {},
          replaceUrl: true
        });
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
          this.academicYears = response.data.content;
        },

        error: (error) => {
          console.error(
            'Failed to load academic years:'
          );

          this.academicYears = [];
        }
      });
  }

  // =========================================================
  // LOAD CLASSES
  // =========================================================

  loadClasses(): void {
    this.classService
      .getClasses()
      .subscribe({
        next: (response) => {
          this.classes = response.data;
        },

        error: (error) => {
          console.error(
            'Failed to load classes:'
          );

          this.classes = [];
        }
      });
  }

  // =========================================================
  // LOAD SECTIONS
  // =========================================================

  loadSections(): void {
    this.sections = [];
    this.selectedSectionId = null;

    if (this.selectedClassId === null) {
      return;
    }

    this.sectionService
      .getSections(this.selectedClassId)
      .subscribe({
        next: (response) => {
          this.sections = response.data;
        },

        error: (error) => {
          console.error(
            'Failed to load sections:'
          );

          this.sections = [];
        }
      });
  }

  // =========================================================
  // LOAD STUDENTS
  // =========================================================

  loadStudents(): void {
    this.loading = true;
    this.errorMessage = '';

    this.cdr.detectChanges();

    this.studentService
      .getStudents(
        this.page,
        this.size,
        this.search,
        this.selectedAcademicYearId ?? undefined,
        this.selectedClassId ?? undefined,
        this.selectedSectionId ?? undefined,
        this.sortBy,
        this.sortDirection
      )
      .subscribe({
        next: (response) => {
          const pageStudents = response.data.content;

          this.totalElements = response.data.totalElements;

          this.loadCombinedStudentData(pageStudents);
        },

        error: (error) => {
          console.error(
            'Failed to load students:'
          );

          this.students = [];
          this.totalElements = 0;

          this.errorMessage =
            'Failed to load students. Please try again.';

          this.loading = false;

          this.cdr.detectChanges();
        }
      });
  }

  private loadCombinedStudentData(
    pageStudents: Student[]
  ): void {
    this.attendanceService.getAttendance().subscribe({
      next: (attendanceResponse) => {
        this.attendanceRecords =
          attendanceResponse.data ?? [];

        this.studentFeeService.getAll().subscribe({
          next: (feeResponse) => {
            this.studentFees =
              feeResponse.data ?? [];

            this.students =
              pageStudents.map(student =>
                this.buildStudentListRow(student)
              );

            this.loading = false;

            this.cdr.detectChanges();
          },

          error: (error) => {
            console.error(
              'Failed to load student fees:'
            );

            this.studentFees = [];

            this.students =
              pageStudents.map(student =>
                this.buildStudentListRow(student)
              );

            this.loading = false;

            this.cdr.detectChanges();
          }
        });
      },

      error: (error) => {
        console.error(
          'Failed to load attendance:'
        );

        this.attendanceRecords = [];

        this.studentFeeService.getAll().subscribe({
          next: (feeResponse) => {
            this.studentFees =
              feeResponse.data ?? [];

            this.students =
              pageStudents.map(student =>
                this.buildStudentListRow(student)
              );

            this.loading = false;

            this.cdr.detectChanges();
          },

          error: () => {
            this.studentFees = [];

            this.students =
              pageStudents.map(student =>
                this.buildStudentListRow(student)
              );

            this.loading = false;

            this.cdr.detectChanges();
          }
        });
      }
    });
  }

  private buildStudentListRow(
    student: Student
  ): StudentListRow {

    const attendanceRecords =
      this.attendanceRecords.filter(
        record => record.studentId === student.id
      );

    const presentCount =
      attendanceRecords.filter(
        record => record.status === 'PRESENT'
      ).length;

    const absentCount =
      attendanceRecords.filter(
        record => record.status === 'ABSENT'
      ).length;

    const attendanceTotal =
      presentCount + absentCount;

    const attendancePercentage =
      attendanceTotal > 0
        ? Number(
          (
            presentCount /
            attendanceTotal *
            100
          ).toFixed(1)
        )
        : 0;

    const fees =
      this.studentFees.filter(
        fee => fee.studentId === student.id
      );

    const originalFee =
      fees.reduce(
        (sum, fee) =>
          sum + Number(fee.originalAmount || 0),
        0
      );

    const discountAmount =
      fees.reduce(
        (sum, fee) =>
          sum + Number(fee.discountAmount || 0),
        0
      );

    const payableAmount =
      fees.reduce(
        (sum, fee) =>
          sum + Number(fee.payableAmount || 0),
        0
      );

    const paidAmount =
      fees.reduce(
        (sum, fee) =>
          sum + Number(fee.paidAmount || 0),
        0
      );

    const remainingAmount =
      Math.max(
        payableAmount - paidAmount,
        0
      );

    const feeStatus =
      payableAmount <= 0
        ? 'UNPAID'
        : paidAmount >= payableAmount
          ? 'PAID'
          : paidAmount > 0
            ? 'PARTIALLY_PAID'
            : 'UNPAID';

    const enrollmentNumber =
      fees[0]?.studentId === student.id
        ? ''
        : '';

    return {
      ...student,

      enrollmentNumber,

      originalFee,
      discountAmount,
      payableAmount,
      paidAmount,
      remainingAmount,
      feeStatus,

      attendancePercentage
    };
  }

  private attendanceRecords: Attendance[] = [];
  private studentFees: StudentFee[] = [];

  // =========================================================
  // SEARCH
  // =========================================================

  onSearch(value: string): void {
    this.search = value;
    this.page = 0;

    this.loadStudents();
  }

  // =========================================================
  // ACADEMIC YEAR FILTER
  // =========================================================

  onAcademicYearChange(value: string): void {
    this.selectedAcademicYearId =
      value
        ? Number(value)
        : null;

    this.selectedClassId = null;
    this.selectedSectionId = null;

    this.sections = [];

    this.page = 0;

    this.loadStudents();
  }

  get filteredClasses(): AcademicClass[] {
    if (this.selectedAcademicYearId === null) {
      return this.classes;
    }

    return this.classes.filter(
      classItem =>
        classItem.academicYearId ===
        this.selectedAcademicYearId
    );
  }

  // =========================================================
  // CLASS FILTER
  // =========================================================

  onClassChange(value: string): void {
    this.selectedClassId =
      value
        ? Number(value)
        : null;

    this.selectedSectionId = null;
    this.sections = [];

    if (this.selectedClassId !== null) {
      this.loadSections();
    }

    this.page = 0;

    this.loadStudents();
  }

  // =========================================================
  // SECTION FILTER
  // =========================================================

  onSectionChange(value: string): void {
    this.selectedSectionId =
      value
        ? Number(value)
        : null;

    this.page = 0;

    this.loadStudents();
  }

  // =========================================================
  // CLEAR FILTERS
  // =========================================================

  clearFilters(): void {
    this.selectedAcademicYearId = null;
    this.selectedClassId = null;
    this.selectedSectionId = null;

    this.sections = [];

    this.page = 0;

    this.loadStudents();
  }

  get hasActiveFilters(): boolean {
    return (
      this.selectedAcademicYearId !== null ||
      this.selectedClassId !== null ||
      this.selectedSectionId !== null
    );
  }

  // =========================================================
  // PAGINATION
  // =========================================================

  onPageChange(page: number): void {
    this.page = page - 1;

    this.loadStudents();
  }

  onSortChange(event: {
    sortBy: string | null;
    sortDirection: 'asc' | 'desc' | null;
  }): void {
    this.sortBy = event.sortBy;
    this.sortDirection = event.sortDirection;
    this.page = 0;

    this.loadStudents();
  }

  onStudentSelectionChange(selectedIds: number[]): void {
  this.selectedStudentIds = selectedIds;
}

get selectedStudentCount(): number {
  return this.selectedStudentIds.length;
}

clearStudentSelection(): void {
  this.selectedStudentIds = [];
}

toggleBulkSelectionMode(): void {
  this.bulkSelectionMode = !this.bulkSelectionMode;

  if (!this.bulkSelectionMode) {
    this.clearStudentSelection();
  }
}

openBulkEdit(): void {
  if (!this.selectedStudentIds.length) {
    return;
  }

  this.bulkEditStep = 'edit';
  this.bulkEditOpen = true;
  this.bulkSelectedFields.clear();

  this.resetBulkEditValues();
  this.loadBulkEditOptions();
}

private loadBulkEditOptions(): void {
  this.schoolService
    .getAll()
    .subscribe({
      next: response => {
        this.schools = response.data.content;
        this.cdr.detectChanges();
      },
      error: error => {
        console.error('Failed to load schools:', error);
        this.schools = [];
      }
    });

  this.branchService
    .getAll(0, 100, 'name,asc')
    .subscribe({
      next: response => {
        this.branches = (response.content ?? [])
          .filter((branch: Branch) => branch.isActive);
        this.cdr.detectChanges();
      },
      error: error => {
        console.error('Failed to load branches:', error);
        this.branches = [];
      }
    });

  this.boardMediumService
    .getAll(0, 100, 'name,asc')
    .subscribe({
      next: response => {
        this.boardMedia = (response.content ?? [])
          .filter((boardMedium: BoardMedium) => boardMedium.isActive);
        this.cdr.detectChanges();
      },
      error: error => {
        console.error('Failed to load board-media:', error);
        this.boardMedia = [];
      }
    });
}

closeBulkEdit(): void {
  if (this.bulkUpdating) {
    return;
  }

  this.bulkEditOpen = false;
  this.bulkEditStep = 'edit';
}

toggleBulkField(field: string): void {
  if (this.bulkSelectedFields.has(field)) {
    this.bulkSelectedFields.delete(field);
  } else {
    this.bulkSelectedFields.add(field);
  }
}

isBulkFieldSelected(field: string): boolean {
  return this.bulkSelectedFields.has(field);
}

private resetBulkEditValues(): void {
  this.bulkFirstName = '';
  this.bulkLastName = '';
  this.bulkPhone = '';
  this.bulkGender = null;

  this.bulkSchoolId = null;
  this.bulkBranchId = null;
  this.bulkBoardMediumId = null;

  this.bulkAcademicYearId = null;
  this.bulkClassId = null;
  this.bulkSectionId = null;

  this.bulkFilteredClasses = [];
  this.bulkSections = [];
}

onBulkAcademicYearChange(): void {
  this.bulkClassId = null;
  this.bulkSectionId = null;

  this.bulkFilteredClasses = [];
  this.bulkSections = [];

  if (this.bulkAcademicYearId === null) {
    return;
  }

  this.bulkFilteredClasses = this.classes.filter(
    classroom =>
      Number(classroom.academicYearId) ===
      Number(this.bulkAcademicYearId)
  );
}

onBulkClassChange(): void {
  this.bulkSectionId = null;
  this.bulkSections = [];

  if (this.bulkClassId === null) {
    return;
  }

  this.sectionService
    .getSections(this.bulkClassId)
    .subscribe({
      next: response => {
        this.bulkSections = response.data;
        this.cdr.detectChanges();
      },
      error: error => {
        console.error(
          'Failed to load bulk edit sections:',
          error
        );

        this.bulkSections = [];
      }
    });
}

getBulkSchoolName(): string {
  return this.schools.find(
    school => school.id === this.bulkSchoolId
  )?.name ?? 'No School';
}

getBulkBranchName(): string {
  return this.branches.find(
    branch => branch.id === this.bulkBranchId
  )?.name ?? 'No Branch';
}

getBulkBoardMediumName(): string {
  return this.boardMedia.find(
    board => board.id === this.bulkBoardMediumId
  )?.name ?? 'No Board Medium';
}

getBulkAcademicYearName(): string {
  return this.academicYears.find(
    year => year.id === this.bulkAcademicYearId
  )?.name ?? '';
}

getBulkClassName(): string {
  return this.bulkFilteredClasses.find(
    classroom => classroom.id === this.bulkClassId
  )?.name ?? '';
}

getBulkSectionName(): string {
  return this.bulkSections.find(
    section => section.id === this.bulkSectionId
  )?.name ?? '';
}

previewBulkEdit(): void {
  if (!this.bulkSelectedFields.size) {
    this.errorMessage =
      'Select at least one field to update.';
    return;
  }

  if (
    this.bulkSelectedFields.has('firstName') &&
    !this.bulkFirstName.trim()
  ) {
    this.errorMessage =
      'First name cannot be empty.';
    return;
  }

  if (
    this.bulkSelectedFields.has('lastName') &&
    !this.bulkLastName.trim()
  ) {
    this.errorMessage =
      'Last name cannot be empty.';
    return;
  }

  const academicFields = [
    'academicYearId',
    'classId',
    'sectionId'
  ];

  const hasAcademicField = academicFields.some(
    field => this.bulkSelectedFields.has(field)
  );

  if (hasAcademicField) {
    const allAcademicFieldsSelected =
      academicFields.every(
        field => this.bulkSelectedFields.has(field)
      );

    if (!allAcademicFieldsSelected) {
      this.errorMessage =
        'Select Academic Year, Class and Section together.';
      return;
    }

    if (
      this.bulkAcademicYearId === null ||
      this.bulkClassId === null ||
      this.bulkSectionId === null
    ) {
      this.errorMessage =
        'Academic Year, Class and Section are required.';
      return;
    }
  }

  this.errorMessage = '';
  this.bulkEditStep = 'preview';
}

saveBulkEdit(): void {
  const selectedFields = Array.from(this.bulkSelectedFields);
  const request: BulkUpdateStudentRequest = {
    studentIds: [...this.selectedStudentIds],
    selectedFields
  };

  if (this.bulkSelectedFields.has('firstName')) {
    request.firstName = this.bulkFirstName.trim();
  }
  if (this.bulkSelectedFields.has('lastName')) {
    request.lastName = this.bulkLastName.trim();
  }
  if (this.bulkSelectedFields.has('phone')) {
    request.phone = this.bulkPhone.trim();
  }
  if (this.bulkSelectedFields.has('gender')) {
    request.gender = this.bulkGender;
  }
  if (this.bulkSelectedFields.has('schoolId')) {
    request.schoolId = this.bulkSchoolId;
  }
  if (this.bulkSelectedFields.has('branchId')) {
    request.branchId = this.bulkBranchId;
  }
  if (this.bulkSelectedFields.has('boardMediumId')) {
    request.boardMediumId = this.bulkBoardMediumId;
  }
  if (
    this.bulkSelectedFields.has('academicYearId') &&
    this.bulkAcademicYearId !== null
  ) {
    request.academicYearId = this.bulkAcademicYearId;
  }
  if (
    this.bulkSelectedFields.has('classId') &&
    this.bulkClassId !== null
  ) {
    request.classId = this.bulkClassId;
  }
  if (
    this.bulkSelectedFields.has('sectionId') &&
    this.bulkSectionId !== null
  ) {
    request.sectionId = this.bulkSectionId;
  }

  this.bulkUpdating = true;
  this.errorMessage = '';

  this.studentService
    .bulkUpdateStudents(request)
    .subscribe({
      next: response => {
        this.bulkUpdating = false;
        this.successMessage = response.message;
        this.closeBulkEdit();
        this.selectedStudentIds = [];
        this.loadStudents();
      },
      error: error => {
        this.bulkUpdating = false;
        this.errorMessage =
          error?.error?.message ??
          'Failed to update students. Please try again.';
        this.cdr.detectChanges();
      }
    });
}

  // =========================================================
  // TABLE ACTIONS
  // =========================================================

  onAction(event: any): void {
    const id = Number(
      event.row['id']
    );

    switch (event.action.type) {

      case 'view':
        this.openStudentQuickView(id);
        break;

      case 'edit':
        this.openEditStudent(id);
        break;

      case 'status':
        this.toggleStatus(
          event.row
        );
        break;

      case 'delete':
        this.deleteStudent(
          event.row
        );
        break;
    }
  }

  // =========================================================
  // STATUS
  // =========================================================

  toggleStatus(student: Student): void {
    const newStatus =
      !student.isActive;

    const action =
      newStatus
        ? 'activate'
        : 'deactivate';

    this.pendingStudent = student;
    this.pendingAction = 'status';
    this.pendingNewStatus = newStatus;

    this.confirmationTitle =
      newStatus
        ? 'Activate Student?'
        : 'Deactivate Student?';

    this.confirmationMessage =
      `Are you sure you want to ${action} ${student.firstName} ${student.lastName}?`;

    this.confirmationConfirmLabel =
      newStatus
        ? 'Activate'
        : 'Deactivate';

    this.showConfirmationDialog = true;
  }

  // =========================================================
  // DELETE
  // =========================================================

  deleteStudent(student: Student): void {
    this.pendingStudent = student;
    this.pendingAction = 'delete';
    this.pendingNewStatus = null;

    this.confirmationTitle =
      'Delete Student?';

    this.confirmationMessage =
      `Are you sure you want to delete ${student.firstName} ${student.lastName}?`;

    this.confirmationConfirmLabel =
      'Delete';

    this.showConfirmationDialog = true;
  }

  // =========================================================
  // CONFIRM ACTION
  // =========================================================

  confirmAction(): void {
    const student = this.pendingStudent;
    const action = this.pendingAction;

    if (!student || !action) {
      return;
    }

    this.showConfirmationDialog = false;

    if (action === 'status') {
      const newStatus =
        this.pendingNewStatus;

      if (newStatus === null) {
        return;
      }

      this.studentService
        .updateStatus(
          student.id,
          newStatus
        )
        .subscribe({
          next: () => {

            // Update screen immediately
            student.isActive =
              newStatus;

            this.cdr.detectChanges();
          },

          error: (error) => {
            console.error(
              'Failed to update student status:'
            );

            this.errorMessage =
              'Failed to update student status. Please try again.';

            this.cdr.detectChanges();
          }
        });
    }

    if (action === 'delete') {
      this.studentService
        .deleteStudent(student.id)
        .subscribe({
          next: () => {
            this.loadStudents();
          },

          error: (error) => {
            console.error(
              'Failed to delete student:'
            );

            this.errorMessage =
              error?.error?.message ||
              error?.error?.error ||
              error?.message ||
              'Failed to delete student. Please try again.';

            this.cdr.detectChanges();
          }
        });
    }

    this.pendingStudent = null;
    this.pendingAction = null;
    this.pendingNewStatus = null;
  }

  // =========================================================
  // CANCEL CONFIRMATION
  // =========================================================

  cancelConfirmation(): void {
    this.showConfirmationDialog = false;

    this.pendingStudent = null;
    this.pendingAction = null;
    this.pendingNewStatus = null;
  }

  // =========================================================
  // VIEW MODE
  // =========================================================

  setViewMode(
    mode: 'table' | 'cards'
  ): void {
    this.viewMode = mode;
  }

  // =========================================================
  // EXPORT
  // =========================================================

  toggleExportMenu(): void {
    this.exportMenuOpen = !this.exportMenuOpen;
  }

  closeExportMenu(): void {
    this.exportMenuOpen = false;
  }

  exportStudentsCsv(): void {
    this.exportMenuOpen = false;

    if (this.exporting) {
      return;
    }

    this.exporting = true;
    this.errorMessage = '';

    this.studentService
      .getStudentsForExport(
        this.search,
        this.selectedAcademicYearId ?? undefined,
        this.selectedClassId ?? undefined,
        this.selectedSectionId ?? undefined
      )
      .subscribe({
        next: (response) => {
          const students = response.data.content;

          this.loadCombinedStudentDataForExport(students);

          this.exporting = false;
          this.cdr.detectChanges();
        },

        error: (error) => {
          console.error('Failed to delete student.');

          this.exporting = false;
          this.errorMessage =
            'Failed to export students. Please try again.';

          this.cdr.detectChanges();
        }
      });
  }

  private loadCombinedStudentDataForExport(
    students: Student[]
  ): void {
    this.attendanceService.getAttendance().subscribe({
      next: attendanceResponse => {
        this.attendanceRecords =
          attendanceResponse.data ?? [];

        this.studentFeeService.getAll().subscribe({
          next: feeResponse => {
            this.studentFees =
              feeResponse.data ?? [];

            const rows = students.map(student =>
              this.buildStudentListRow(student)
            );

            this.downloadStudentsCsv(rows);
          },

          error: () => {
            this.studentFees = [];

            const rows = students.map(student =>
              this.buildStudentListRow(student)
            );

            this.downloadStudentsCsv(rows);
          }
        });
      },

      error: () => {
        this.attendanceRecords = [];

        this.studentFeeService.getAll().subscribe({
          next: feeResponse => {
            this.studentFees =
              feeResponse.data ?? [];

            const rows = students.map(student =>
              this.buildStudentListRow(student)
            );

            this.downloadStudentsCsv(rows);
          },

          error: () => {
            this.studentFees = [];

            const rows = students.map(student =>
              this.buildStudentListRow(student)
            );

            this.downloadStudentsCsv(rows);
          }
        });
      }
    });
  }

  private downloadStudentsCsv(
    students: StudentListRow[]
  ): void {
    const headers = [
      'Name',
      'Roll No.',
      'School',
      'Academic Year',
      'Class',
      'Section',
      'Status',
      'Email',
      'Phone',
      'Original Fee (₹)',
      'Discount (₹)',
      'Payable (₹)',
      'Paid (₹)',
      'Remaining (₹)',
      'Fee Status',
      'Attendance %'
    ];

    const rows = students.map(student => [
      `${student.firstName ?? ''} ${student.lastName ?? ''}`.trim(),
      student.rollNumber ?? '',
      student.schoolName ?? 'No School',
      student.academicYearName ?? '',
      student.className ?? '',
      student.sectionName ?? '',
      student.isActive ? 'Active' : 'Inactive',
      student.email ?? '',
      student.phone ?? '',
      student.originalFee ?? 0,
      student.discountAmount ?? 0,
      student.payableAmount ?? 0,
      student.paidAmount ?? 0,
      student.remainingAmount ?? 0,
      this.formatFeeStatus(student.feeStatus),
      `${student.attendancePercentage ?? 0}%`
    ]);

    const csv = [
      headers,
      ...rows
    ]
      .map(row =>
        row
          .map(value => this.escapeCsvValue(value))
          .join(',')
      )
      .join('\r\n');

    const blob = new Blob(
      ['\uFEFF' + csv],
      {
        type: 'text/csv;charset=utf-8;'
      }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');

    link.href = url;
    link.download = `students-${this.getExportDate()}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  private formatFeeStatus(status: string): string {
    switch (status) {
      case 'PAID':
        return 'Paid';

      case 'PARTIALLY_PAID':
        return 'Partially Paid';

      case 'UNPAID':
        return 'Unpaid';

      default:
        return status ?? '';
    }
  }

  private escapeCsvValue(value: string | number | null | undefined): string {
    const text = String(value ?? '');

    if (
      text.includes(',') ||
      text.includes('"') ||
      text.includes('\n') ||
      text.includes('\r')
    ) {
      return `"${text.replace(/"/g, '""')}"`;
    }

    return text;
  }

  private getExportDate(): string {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  // =========================================================
  // STUDENT QUICK VIEW
  // =========================================================

  openStudentQuickView(
    studentId: number
  ): void {
    if (
      !Number.isFinite(studentId) ||
      studentId <= 0
    ) {
      return;
    }

    this.quickViewStudentId = studentId;

    this.cdr.detectChanges();
  }

  closeStudentQuickView(): void {
    this.quickViewStudentId = null;

    this.cdr.detectChanges();
  }

  openStudentWorkspace(
    studentId: number
  ): void {
    this.closeStudentQuickView();

    this.router.navigate([
      '/admin/students',
      studentId
    ]);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    if (!target.closest('.export-wrapper')) {
      this.exportMenuOpen = false;
    }
  }

  private formatCurrency(value: number): string {
    return `₹${Number(value || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }

  // =========================================================
  // EDIT STUDENT POPUP
  // =========================================================

  openEditStudent(studentId: number): void {
    if (!Number.isFinite(studentId) || studentId <= 0) {
      return;
    }

    this.editStudentId = studentId;
    this.editPopupOpen = true;

    this.cdr.detectChanges();
  }

  openAddStudent(): void {
    this.addPopupOpen = true;
    this.cdr.detectChanges();
  }

  closeAddStudent(): void {
    this.addPopupOpen = false;
    this.cdr.detectChanges();
  }

openStudentImport(): void {
  this.importPopupOpen = true;
}

closeStudentImport(): void {
  this.importPopupOpen = false;
}

onStudentsImported(): void {
  this.importPopupOpen = false;
  this.loadStudents();
}

  onStudentCreated(): void {
    this.closeAddStudent();

    this.page = 0;
    this.loadStudents();

    this.successMessage = 'Student created successfully.';

    this.cdr.detectChanges();

    setTimeout(() => {
      this.successMessage = '';
      this.cdr.detectChanges();
    }, 3000);
  }

  closeEditStudent(): void {
    this.editPopupOpen = false;
    this.editStudentId = null;

    this.cdr.detectChanges();
  }

  onStudentSaved(): void {
    this.closeEditStudent();

    // Refresh the current page without changing
    // search, filters or pagination.
    this.loadStudents();
  }



}
