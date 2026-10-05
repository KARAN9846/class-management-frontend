import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Output,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  StudentImportError,
  StudentImportResult,
  StudentImportSetupRequest,
  StudentImportValidationResponse,
  StudentService
} from '../services/student.service';

@Component({
  selector: 'app-student-import',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-import.html',
  styleUrl: './student-import.scss'
})
export class StudentImportComponent {

  private readonly studentService = inject(StudentService);
  private readonly cdr = inject(ChangeDetectorRef);

  @Output() closed = new EventEmitter<void>();
  @Output() imported = new EventEmitter<void>();

  selectedFile: File | null = null;

  validating = false;
  downloadingTemplate = false;

  importing = false;

  importResult: StudentImportResult | null = null;

  validationResult: StudentImportValidationResponse | null = null;

  setupConfirmed = false;

  private setupApprovals = new Map<string, boolean>();

  private feeAmountOverrides = new Map<string, number>();

  errorMessage = '';
  successMessage = '';

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    this.selectFile(input.files[0]);

    // Allow selecting the same file again.
    input.value = '';
  }

  selectFile(file: File): void {
    this.clearMessages();
    this.validationResult = null;

    this.setupConfirmed = false;
    this.importResult = null;

    if (!file.name.toLowerCase().endsWith('.xlsx')) {
      this.errorMessage =
        'Please select a valid Excel file (.xlsx).';

      this.selectedFile = null;
      this.cdr.detectChanges();
      return;
    }

    if (file.size === 0) {
      this.errorMessage =
        'The selected file is empty.';

      this.selectedFile = null;
      this.cdr.detectChanges();
      return;
    }

    this.selectedFile = file;

    this.cdr.detectChanges();
  }

  removeFile(): void {
    this.selectedFile = null;
    this.validationResult = null;
    this.setupConfirmed = false;
    this.importResult = null;
    this.clearMessages();

    this.cdr.detectChanges();
  }

  downloadTemplate(): void {
    if (this.downloadingTemplate) {
      return;
    }

    this.downloadingTemplate = true;
    this.clearMessages();

    this.studentService
      .downloadImportTemplate()
      .subscribe({
        next: (blob) => {
          const url = URL.createObjectURL(blob);

          const link = document.createElement('a');

          link.href = url;
          link.download = 'student-import-template.xlsx';

          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          URL.revokeObjectURL(url);

          this.downloadingTemplate = false;
          this.successMessage =
            'Excel template downloaded successfully.';

          this.cdr.detectChanges();
        },

        error: (error) => {
          console.error(
            'Failed to download student import template:',
            error
          );

          this.downloadingTemplate = false;

          this.errorMessage =
            error?.error?.message ||
            'Failed to download the Excel template. Please try again.';

          this.cdr.detectChanges();
        }
      });
  }

  validateFile(): void {
    if (!this.selectedFile || this.validating) {
      return;
    }

    this.validating = true;
    this.validationResult = null;
    this.setupConfirmed = false;
    this.clearMessages();

    this.studentService
      .validateImport(this.selectedFile)
      .subscribe({
        next: (response) => {
          this.validationResult = response.data;

          this.validating = false;

          if (this.validationResult.errorRows === 0) {
            this.successMessage =
              'Excel file validation completed successfully.';
          }

          this.cdr.detectChanges();
        },

        error: (error) => {
          console.error(
            'Failed to validate student import:',
            error
          );

          this.validating = false;

          const backendMessage =
            error?.error?.message ||
            error?.error?.error;

          this.errorMessage =
            backendMessage ||
            'Failed to validate the Excel file. Please check the file and try again.';

          this.cdr.detectChanges();
        }
      });
  }


  canProceedWithSetup(): boolean {
  const preview = this.validationResult?.preview;

  if (!preview) {
    return false;
  }

  const allApproved = [
    ...preview.branches.map(name =>
      this.isSetupApproved(this.getSetupKey('branch', name))
    ),

    ...preview.boardMedia.map(name =>
      this.isSetupApproved(this.getSetupKey('boardMedium', name))
    ),

    ...preview.schools.map(name =>
      this.isSetupApproved(this.getSetupKey('school', name))
    ),

    ...preview.academicYears.map(item =>
      this.isSetupApproved(
        this.getSetupKey('academicYear', item.name)
      )
    ),

    ...preview.classes.map(item =>
      this.isSetupApproved(
        this.getSetupKey('class', item.academicYear, item.name)
      )
    ),

    ...preview.sections.map(item =>
      this.isSetupApproved(
        this.getSetupKey(
          'section',
          item.academicYear,
          item.className,
          item.name
        )
      )
    ),

    ...preview.feeStructures.map(item =>
      this.isSetupApproved(
        this.getSetupKey('fee', item.academicYear, item.className)
      )
    )
  ];

  if (allApproved.some(approved => !approved)) {
    return false;
  }

  const academicYearsValid = preview.academicYears.every(item =>
    !!item.startDate &&
    !!item.endDate &&
    item.startDate < item.endDate
  );

  if (!academicYearsValid) {
    return false;
  }

  const feeAmountsValid = preview.feeStructures.every(item => {
    const amount = this.getFeeAmount(
      item.academicYear,
      item.className,
      item.feeAmount
    );

    return amount !== null && Number.isFinite(amount) && amount > 0;
  });

  return feeAmountsValid;
}


  importFile(): void {
    if (
      !this.selectedFile ||
      this.importing ||
      !this.validationResult ||
      this.validationResult.errorRows > 0 ||
      (
  this.hasSetupItems() &&
  (!this.setupConfirmed || !this.canProceedWithSetup())
)
    ) {
      return;
    }

    this.importing = true;
    this.importResult = null;
    this.clearMessages();

    this.studentService
      .importStudents(this.selectedFile, this.buildSetupRequest())
      .subscribe({
        next: (response) => {
          this.importResult = response.data;
          this.importing = false;

          this.successMessage =
            `${this.importResult.importedStudents} student(s) imported successfully.`;

          this.imported.emit();

          this.cdr.detectChanges();
        },

        error: (error) => {
          console.error(
            'Failed to import students:',
            error
          );

          this.importing = false;

          const backendMessage =
            error?.error?.message ||
            error?.error?.error;

          this.errorMessage =
            backendMessage ||
            'Failed to import students. Please try again.';

          this.cdr.detectChanges();
        }
      });
  }

  getSetupKey(...parts: string[]): string {
    return JSON.stringify(parts);
  }

  isSetupApproved(key: string): boolean {
    return this.setupApprovals.get(key) ?? false;
  }

  updateSetupApproval(key: string, approved: boolean): void {
    this.setupApprovals.set(key, approved);
    this.setupConfirmed = false;
  }

  getFeeAmount(
    academicYear: string,
    className: string,
    originalAmount: number | null
  ): number | null {
    const key = this.getSetupKey(academicYear, className);

    return this.feeAmountOverrides.has(key)
      ? this.feeAmountOverrides.get(key)!
      : originalAmount;
  }

  updateFeeAmount(
    academicYear: string,
    className: string,
    value: string
  ): void {
    const key = this.getSetupKey(academicYear, className);
    const amount = value.trim() === '' ? null : Number(value);

    if (amount === null || !Number.isFinite(amount)) {
      this.feeAmountOverrides.delete(key);
    } else {
      this.feeAmountOverrides.set(key, amount);
    }

    this.setupConfirmed = false;
  }

  private buildSetupRequest(): StudentImportSetupRequest {
    const preview = this.validationResult?.preview;

    return {
      branches: (preview?.branches ?? []).map(name => ({
        name,
        approved: true
      })),

      boardMedia: (preview?.boardMedia ?? []).map(name => ({
        name,
        approved: true
      })),

      schools: (preview?.schools ?? []).map(name => ({
        name,
        approved: true
      })),

      academicYears: (preview?.academicYears ?? []).map(item => ({
        name: item.name,
        startDate: item.startDate,
        endDate: item.endDate,
        approved: true
      })),

      classes: (preview?.classes ?? []).map(item => ({
        academicYear: item.academicYear,
        name: item.name,
        approved: true
      })),

      sections: (preview?.sections ?? []).map(item => ({
        academicYear: item.academicYear,
        className: item.className,
        name: item.name,
        approved: true
      })),

      feeStructures: (preview?.feeStructures ?? []).map(item => ({
        academicYear: item.academicYear,
        className: item.className,
        feeAmount: this.getFeeAmount(
          item.academicYear,
          item.className,
          item.feeAmount
        ),
        approved: true
      }))
    };
  }

  updateAcademicYearDate(
    name: string,
    field: 'startDate' | 'endDate',
    value: string
  ): void {
    const academicYear =
      this.validationResult?.preview.academicYears.find(
        item => item.name === name
      );

    if (!academicYear) {
      return;
    }

    academicYear[field] = value || null;

    // Require the admin to review the updated setup again.
    this.setupConfirmed = false;
  }


  hasSetupItems(): boolean {
    const preview = this.validationResult?.preview;

    if (!preview) {
      return false;
    }

    return (
      preview.branches.length > 0 ||
      preview.boardMedia.length > 0 ||
      preview.schools.length > 0 ||
      preview.academicYears.length > 0 ||
      preview.classes.length > 0 ||
      preview.sections.length > 0 ||
      preview.feeStructures.length > 0
    );
  }

  close(): void {
    if (
      this.validating ||
      this.downloadingTemplate ||
      this.importing
    ) {
      return;
    }

    this.closed.emit();
  }

  trackError(
    index: number,
    error: StudentImportError
  ): string {
    return `${error.rowNumber}-${error.field}-${index}`;
  }

  private clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }
}