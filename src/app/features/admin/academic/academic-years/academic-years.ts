import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SearchInputComponent } from '../../../../shared/components/search-input/search-input.component';
import { DataTableComponent, TableAction, TableColumn } from '../../../../shared/components/data-table/data-table.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { AcademicYearService } from './services/academic-year.service';
import { AcademicYear, CreateAcademicYearRequest, UpdateAcademicYearRequest } from './academic-year.model';
import { ConfirmationDialogComponent } from '../../../../shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-academic-years',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DataTableComponent,
    SearchInputComponent,
    PageHeaderComponent,
  ConfirmationDialogComponent
  ],
  templateUrl: './academic-years.html',
  styleUrl: './academic-years.scss'
})
export class AcademicYearsComponent implements OnInit {
  private readonly academicYearService = inject(AcademicYearService);
  private readonly cdr = inject(ChangeDetectorRef);

  /* TABLE CONFIG */
  columns: TableColumn[] = [
    { key: 'name', label: 'Academic Year' },
    { key: 'startDate', label: 'Start Date' },
    { key: 'endDate', label: 'End Date' },
    { key: 'isActive', label: 'Status', type: 'status' }
  ];

  actions: TableAction[] = [
    { label: 'Edit', type: 'edit' },
    { label: 'Set Current', type: 'current' },
    { label: 'Delete', type: 'delete', danger: true }
  ];

  /* STATE */
  searchTerm = '';

  onSearch(value: string): void {
    this.searchTerm = value;
  }

  statusFilter: 'ALL' | 'ACTIVE' | 'CLOSED' = 'ALL';
  showForm = false;
  editingYear: AcademicYear | null = null;
  academicYears: AcademicYear[] = [];
  loading = false;
  saving = false;
  errorMessage = '';

  // DELETE CONFIRMATION
showDeleteDialog = false;
academicYearToDelete: AcademicYear | null = null;

  form = {
    name: '',
    startDate: '',
    endDate: '',
    status: 'ACTIVE' as 'ACTIVE' | 'CLOSED'
  };

  /* INIT */
  ngOnInit(): void {
    this.loadAcademicYears();
  }

  /* LOAD */
  loadAcademicYears(): void {
    this.loading = true;
    this.errorMessage = '';

    this.academicYearService.getAll().subscribe({
      next: (response) => {
        this.academicYears = response.data.content;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error(error);
        this.errorMessage =
          error?.error?.message || 'Failed to load academic years.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  /* FILTER */
  get filteredYears(): AcademicYear[] {
    return this.academicYears.filter(year => {
      const searchMatch = year.name
        .toLowerCase()
        .includes(this.searchTerm.toLowerCase());

      const status = year.isActive ? 'ACTIVE' : 'CLOSED';

      const statusMatch =
        this.statusFilter === 'ALL' ||
        status === this.statusFilter;

      return searchMatch && statusMatch;
    });
  }

  /* TABLE ACTION HANDLER */
  onAction(event: any): void {
    const year: AcademicYear = event.row;

    console.log('Action:', event.action.type, year);

    switch (event.action.type) {
      case 'edit':
        this.openEditForm(year);
        break;

      case 'current':
        this.setCurrent(year);
        break;

      case 'delete':
        this.deleteYear(year);
        break;
    }
  }

  /* FORM */
  openAddForm(): void {
    this.editingYear = null;

    this.form = {
      name: '',
      startDate: '',
      endDate: '',
      status: 'ACTIVE'
    };

    this.showForm = true;
  }

  openEditForm(year: AcademicYear): void {
    this.editingYear = year;

    this.form = {
      name: year.name,
      startDate: year.startDate,
      endDate: year.endDate,
      status: year.isActive ? 'ACTIVE' : 'CLOSED'
    };

    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
    this.editingYear = null;
  }

  /* SAVE */
  saveYear(): void {
    if (
      !this.form.name ||
      !this.form.startDate ||
      !this.form.endDate
    ) {
      return;
    }

    this.saving = true;

    if (this.editingYear) {
      const request: UpdateAcademicYearRequest = {
        name: this.form.name,
        startDate: this.form.startDate,
        endDate: this.form.endDate,
        isActive: this.form.status === 'ACTIVE'
      };

      this.academicYearService
        .update(this.editingYear.id, request)
        .subscribe({
          next: () => {
            this.saving = false;
            this.closeForm();
            this.loadAcademicYears();
          },
          error: (error) => {
            console.error(error);
            this.errorMessage =
              error?.error?.message ||
              'Failed to update academic year.';
            this.saving = false;
            this.cdr.markForCheck();
          }
        });

      return;
    }

    const request: CreateAcademicYearRequest = {
      name: this.form.name,
      startDate: this.form.startDate,
      endDate: this.form.endDate
    };

    this.academicYearService.create(request).subscribe({
      next: () => {
        this.saving = false;
        this.closeForm();
        this.loadAcademicYears();
      },
      error: (error) => {
        console.error(error);
        this.errorMessage =
          error?.error?.message ||
          'Failed to create academic year.';
        this.saving = false;
        this.cdr.markForCheck();
      }
    });
  }

  /* SET CURRENT */
  setCurrent(year: AcademicYear): void {
    console.log('Setting current year:', year);

    if (year.isCurrent) {
      return;
    }

    this.academicYearService.setCurrent(year.id).subscribe({
      next: (response) => {
        console.log('Set current success', response);
        this.loadAcademicYears();
      },
      error: (error) => {
        console.error('Set current failed', error);

        this.errorMessage =
          error?.error?.message ||
          'Failed to set current academic year.';

        this.cdr.markForCheck();
      }
    });
  }

  /* DELETE */
  deleteYear(year: AcademicYear): void {
  this.academicYearToDelete = year;
  this.showDeleteDialog = true;
  this.cdr.markForCheck();
}

cancelDeleteYear(): void {
  this.showDeleteDialog = false;
  this.academicYearToDelete = null;
  this.cdr.markForCheck();
}

confirmDeleteYear(): void {
  const year = this.academicYearToDelete;

  if (!year) {
    return;
  }

  this.showDeleteDialog = false;
  this.academicYearToDelete = null;

  this.academicYearService.delete(year.id).subscribe({
    next: () => {
      this.loadAcademicYears();
    },
    error: (error) => {
      console.error(error);

      this.errorMessage =
        error?.error?.message ||
        'Failed to delete academic year.';

      this.cdr.markForCheck();
    }
  });
}
}