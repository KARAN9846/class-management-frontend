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


  importFile(): void {
    if (
      !this.selectedFile ||
      this.importing ||
      !this.validationResult ||
      this.validationResult.errorRows > 0
    ) {
      return;
    }

    this.importing = true;
    this.importResult = null;
    this.clearMessages();

    this.studentService
      .importStudents(this.selectedFile)
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